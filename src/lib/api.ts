/**
 * Safe fetch with automatic retry on transient gateway/warmup errors (502, 503, 504, network drops).
 * Handles Cloud Run container warmup and proxy latency transparently.
 */
export async function apiFetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);

      // Check if status is a transient gateway / warmup error
      const isTransientGateway = res.status === 502 || res.status === 503 || res.status === 504;
      const contentType = res.headers.get('content-type') || '';
      const isHtmlWarmup = !contentType.includes('application/json') && (res.status >= 500 || res.status === 404);

      if (!isTransientGateway && !isHtmlWarmup) {
        return res;
      }

      // If transient, delay and retry
      if (attempt < maxRetries) {
        const delay = (attempt + 1) * 600;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return res;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error('Network connection error');
      if (attempt < maxRetries) {
        const delay = (attempt + 1) * 600;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw lastError || new Error('Network request failed after retries');
}

/**
 * Executes a JSON API call with automatic retries for transient warming states and structured error parsing.
 */
export async function apiJsonRequest<T>(
  url: string,
  options: RequestInit = {},
  fallbackErrorMessage = 'Request failed'
): Promise<T> {
  const res = await apiFetchWithRetry(url, options, 3);
  const contentType = res.headers.get('content-type') || '';

  if (!res.ok) {
    if (contentType.includes('application/json')) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error?.message || fallbackErrorMessage);
    } else {
      const text = await res.text().catch(() => '');
      if (
        text.includes('warmup') ||
        text.includes('The page') ||
        text.includes('Gateway') ||
        res.status === 502 ||
        res.status === 503
      ) {
        throw new Error('Service is warming up. Please click "Retry" in a few seconds.');
      }
      throw new Error(`Server returned error status ${res.status}`);
    }
  }

  if (!contentType.includes('application/json')) {
    throw new Error('Unexpected response format from server. Please try again.');
  }

  return (await res.json()) as T;
}
