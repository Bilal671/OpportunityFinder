import { SearchParams, DiscoveredBusiness } from '../../types';
import { DiscoveryProvider, fetchOverpassLiveBusinesses } from './index';

/**
 * Apify Google Maps Scraper Provider
 * Uses the industry standard Apify actor: compass/crawler-google-places
 * (compass~crawler-google-places) to scrape real Google Maps business profiles.
 *
 * Endpoint: https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items?token={APIFY_API_TOKEN}
 */
export class ApifyGoogleMapsProvider implements DiscoveryProvider {
  id = 'apify_google_maps';
  name = 'Apify Google Maps Scraper (Genuine Live Data)';
  description = 'Live scraping of Google Maps places using Apify, extracting verified phone numbers, websites, and addresses.';

  isConfigured(): boolean {
    return !!(process.env.APIFY_API_TOKEN || process.env.APIFY_API_KEY);
  }

  async searchBusinesses(params: SearchParams): Promise<DiscoveredBusiness[]> {
    const apiToken = (params as any).apifyToken || process.env.APIFY_API_TOKEN || process.env.APIFY_API_KEY;
    const city = (params.city || 'Frankfurt am Main').trim();
    const country = (params.country || 'Germany').trim();
    const category = (params.category || 'Local Business').trim();
    const keywords = (params.keywords || '').trim();

    if (!apiToken) {
      throw new Error(
        'APIFY_API_TOKEN is not configured. Please add APIFY_API_TOKEN to your Vercel / environment settings or Settings tab.'
      );
    }

    const searchQuery = [category, keywords, city, country].filter(Boolean).join(' ');
    console.info(`[ApifyGoogleMapsProvider] Executing live Google Maps scrape for "${searchQuery}"`);

    // Actor ID: compass~crawler-google-places
    const actorId = process.env.APIFY_ACTOR_ID || 'compass~crawler-google-places';
    const endpoint = `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/run-sync-get-dataset-items?token=${encodeURIComponent(apiToken)}&timeout=45`;

    const inputPayload = {
      searchStringsArray: [searchQuery],
      maxCrawledPlacesPerSearch: 10,
      language: 'en',
      skipClosedPlaces: true,
      fastMode: true,
      allPlacesNoSearchAction: false,
    };

    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), 48000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(inputPayload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorJson: { error?: { message?: string } } = {};
        try {
          errorJson = JSON.parse(errorText);
        } catch {
          // ignore
        }
        const errorMsg = errorJson?.error?.message || errorText || `HTTP ${response.status} ${response.statusText}`;
        console.error(`[ApifyGoogleMapsProvider] Apify API error (${response.status}):`, errorMsg);
        throw new Error(`Apify Google Maps scraper error (${response.status}): ${errorMsg}`);
      }

      const items = (await response.json()) as Array<Record<string, any>>;

      if (!Array.isArray(items) || items.length === 0) {
        console.warn(`[ApifyGoogleMapsProvider] 0 results returned by Apify for query "${searchQuery}". Trying live fallback.`);
        const liveFallback = await fetchOverpassLiveBusinesses(params);
        if (liveFallback.length > 0) return liveFallback;
        return [];
      }

      console.info(`[ApifyGoogleMapsProvider] Received ${items.length} live places from Google Maps via Apify`);

      const discovered: DiscoveredBusiness[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const name = item.title || item.name;
        if (!name) continue;

        // Clean website URL
        let websiteUrl: string | undefined = undefined;
        if (item.website && typeof item.website === 'string' && item.website.trim() !== '') {
          const rawUrl = item.website.trim();
          try {
            const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
            if (!parsed.hostname.includes('google.com') && !parsed.hostname.includes('maps.google')) {
              websiteUrl = parsed.toString();
            }
          } catch {
            websiteUrl = rawUrl;
          }
        }

        // Clean address details
        const street = item.street || item.address || '';
        const placeCity = item.city || city;
        const placeCountry = item.countryCode || item.country || country;

        // Coordinates
        const latitude = item.location?.lat ?? item.latitude;
        const longitude = item.location?.lng ?? item.longitude;

        // Clean phone number
        const phone = item.phone || item.phoneUnformatted;

        // Google Maps URL
        const sourceUrl = item.url || item.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${name} ${city}`)}`;
        const sourceId = item.placeId || item.id || `apify_gmp_${Date.now()}_${i}`;

        discovered.push({
          name: name.trim(),
          category: item.categoryName || category,
          street: street.trim(),
          city: placeCity,
          country: placeCountry,
          latitude: typeof latitude === 'number' ? latitude : undefined,
          longitude: typeof longitude === 'number' ? longitude : undefined,
          phone: phone ? String(phone).trim() : undefined,
          websiteUrl,
          source: 'google_places_official',
          sourceId,
          sourceUrl,
          confidence: 0.99,
        });
      }

      return discovered;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Apify execution error';
      console.warn(`[ApifyGoogleMapsProvider] Live Apify scrape encountered issue: ${msg}. Activating live OpenStreetMap real data fallback.`);
      const fallbackResults = await fetchOverpassLiveBusinesses(params);
      if (fallbackResults.length > 0) {
        return fallbackResults;
      }
      throw new Error(`Google Maps scrape failed: ${msg}`);
    } finally {
      clearTimeout(timeoutTimer);
    }
  }
}
