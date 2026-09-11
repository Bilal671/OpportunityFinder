/**
 * Resilient API client for AI Local Business Opportunity Finder.
 * Handles server warm-up (cold starts / 502 / 503 / HTML responses),
 * transient network glitches, automatic retries with exponential backoff,
 * and safe JSON parsing.
 */

export interface ApiClientConfig {
  maxRetries?: number;
  baseDelayMs?: number;
  autoWaitForWarmup?: boolean;
  timeoutMs?: number;
}

export class ApiError extends Error {
  status: number;
  isWarmup: boolean;
  code?: string;

  constructor(message: string, status = 500, isWarmup = false, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isWarmup = isWarmup;
    this.code = code;
  }
}

/**
 * Checks backend health endpoint.
 */
export async function checkBackendHealth(timeoutMs = 4000): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch('/api/health', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    return data && data.status === 'ok';
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Actively polls /api/health until the server is ready or timeout is reached.
 */
export async function waitForBackendReady(
  maxWaitMs = 15000,
  pollIntervalMs = 800,
  onAttempt?: (elapsedMs: number) => void
): Promise<boolean> {
  const start = Date.now();

  while (Date.now() - start < maxWaitMs) {
    if (onAttempt) {
      onAttempt(Date.now() - start);
    }
    const isHealthy = await checkBackendHealth(2000);
    if (isHealthy) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  return false;
}

/**
 * Safely parses response, handling both JSON and unexpected HTML/warmup pages.
 */
async function parseResponsePayload(res: Response): Promise<{ isJson: boolean; data: any; text: string }> {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (isJson) {
    try {
      const data = await res.json();
      return { isJson: true, data, text: '' };
    } catch {
      return { isJson: false, data: null, text: '' };
    }
  }

  const text = await res.text().catch(() => '');
  return { isJson: false, data: null, text };
}

/**
 * Tests if response text, json data, or status signifies Cloud Run / Nginx / proxy warm-up or cold-start.
 */
function isWarmupResponse(status: number, text: string, data?: any, endpoint?: string): boolean {
  if (status === 502 || status === 503 || status === 504) {
    return true;
  }
  const lower = (text || '').toLowerCase();
  const dataMsg = ((data?.message || data?.error?.message || data?.error || '') + '').toLowerCase();

  // Known proxy cold-start / warmup strings (including Cloud Run 404 "The page could not be found")
  if (
    lower.includes('warmup') ||
    lower.includes('starting server') ||
    lower.includes('please wait while') ||
    lower.includes('bad gateway') ||
    lower.includes('service unavailable') ||
    lower.includes('gateway timeout') ||
    lower.includes('the page could not be found') ||
    lower.includes('page could not be found') ||
    lower.includes('could not be found') ||
    dataMsg.includes('the page could not be found') ||
    dataMsg.includes('page could not be found') ||
    dataMsg.includes('could not be found')
  ) {
    return true;
  }

  // If a standard known API endpoint returns 404, it is a server-boot or proxy routing glitch
  if (status === 404 && endpoint) {
    const knownApiPrefixes = ['/api/searches', '/api/businesses', '/api/health', '/api/config', '/api/quota'];
    if (knownApiPrefixes.some((p) => endpoint.startsWith(p))) {
      return true;
    }
  }

  return false;
}

/**
 * Resilient API fetch with automatic warm-up recovery and exponential backoff.
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  config: ApiClientConfig = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 600,
    autoWaitForWarmup = true,
    timeoutMs = 30000,
  } = config;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  // Ensure Content-Type is application/json for request body if JSON string
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    try {
      JSON.parse(options.body);
      headers.set('Content-Type', 'application/json');
    } catch {
      // Not JSON string, leave headers untouched
    }
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(endpoint, {
        ...options,
        headers,
        signal: options.signal || controller.signal,
      });

      clearTimeout(timer);

      const { isJson, data, text } = await parseResponsePayload(res);

      // Check if response indicates server warmup or cold-start
      const isWarmup = isWarmupResponse(res.status, text, data, endpoint);

      if (isWarmup) {
        if (attempt < maxRetries) {
          // If autoWaitForWarmup is enabled, perform live health check wait
          if (autoWaitForWarmup) {
            const ready = await waitForBackendReady(8000, 750);
            if (ready) {
              // Server woke up! Retry immediately
              continue;
            }
          }
          const delay = (attempt + 1) * baseDelayMs;
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        throw new ApiError(
          'Connecting to business discovery engine... Server is initializing. Please wait a few seconds and click "Retry Now".',
          res.status,
          true,
          'SERVICE_WARMING_UP'
        );
      }

      if (!res.ok) {
        if (isJson && data) {
          let errMsg =
            data.error?.message ||
            data.message ||
            `Request failed with status ${res.status}`;
          
          if (errMsg.toLowerCase().includes('could not be found')) {
            errMsg = 'Connecting to business discovery engine... Server is initializing. Please click "Retry Now".';
          }

          const errCode = data.error?.code || 'API_ERROR';
          throw new ApiError(errMsg, res.status, false, errCode);
        }

        const rawText = (text || '').toLowerCase();
        let fallbackMsg = `Server returned error status ${res.status}`;
        if (rawText.includes('could not be found') || res.status === 404) {
          fallbackMsg = 'Connecting to business discovery engine... Server is initializing. Please click "Retry Now".';
        }

        throw new ApiError(
          fallbackMsg,
          res.status,
          rawText.includes('could not be found') || res.status === 404
        );
      }

      // Success
      if (isJson && data !== null) {
        return data as T;
      }

      return data as T;
    } catch (err: unknown) {
      clearTimeout(timer);

      if (err instanceof ApiError) {
        lastError = err;
        // Don't retry client-level validation errors (400, 401, 403, 404, 422)
        if (err.status >= 400 && err.status < 500 && !err.isWarmup) {
          throw err;
        }
      } else {
        const message = err instanceof Error ? err.message : 'Network request failed';
        lastError = new ApiError(message, 500, false);
      }

      if (attempt < maxRetries) {
        const delay = (attempt + 1) * baseDelayMs;
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
    }
  }

  throw (
    lastError ||
    new ApiError('Unable to complete request. Please try again.', 500, false)
  );
}
