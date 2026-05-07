import { describe, expect, test } from 'bun:test';

const bandsInTownAppId = process.env.BANDSINTOWN_APP_ID || 'js_example';

const fetchJson = async <T>(url: string): Promise<{ body: T; response: Response }> => {
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  const body = (await response.json()) as T;
  return { body, response };
};

describe('live API smoke tests', () => {
  test('iTunes search returns artist results', async () => {
    const url = 'https://itunes.apple.com/search?term=The+Beatles&country=us&entity=allArtist&limit=1';
    const { body, response } = await fetchJson<{ results: unknown[] }>(url);

    expect(response.status).toBe(200);
    expect(body.results.length).toBeGreaterThan(0);
  });

  test('iTunes lookup returns artist results', async () => {
    const url = 'https://itunes.apple.com/lookup?id=136975';
    const { body, response } = await fetchJson<{ results: unknown[] }>(url);

    expect(response.status).toBe(200);
    expect(body.results.length).toBeGreaterThan(0);
  });

  test('Lyrics.ovh returns lyrics', async () => {
    const url = 'https://api.lyrics.ovh/v1/The%20Beatles/Hey%20Jude';
    const { body, response } = await fetchJson<{ lyrics?: string }>(url);

    expect(response.status).toBe(200);
    expect(body.lyrics?.length ?? 0).toBeGreaterThan(0);
  });

  test('Bandsintown returns artist events', async () => {
    const url = new URL('https://rest.bandsintown.com/artists/Metallica/events');
    url.search = new URLSearchParams({ app_id: bandsInTownAppId }).toString();

    const { body, response } = await fetchJson<unknown[]>(url.toString());

    expect(response.status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  test('Open-Meteo returns historical weather', async () => {
    const url = new URL('https://archive-api.open-meteo.com/v1/archive');
    url.search = new URLSearchParams({
      latitude: '30.2672',
      longitude: '-97.7431',
      start_date: '2024-05-01',
      end_date: '2024-05-01',
      daily: 'temperature_2m_max,temperature_2m_min,weather_code',
      timezone: 'auto',
    }).toString();

    const { body, response } = await fetchJson<{
      daily?: {
        temperature_2m_max?: Array<number | null>;
        temperature_2m_min?: Array<number | null>;
        weather_code?: Array<number | null>;
      };
    }>(url.toString());

    expect(response.status).toBe(200);
    expect(body.daily?.temperature_2m_max?.length ?? 0).toBeGreaterThan(0);
    expect(body.daily?.temperature_2m_min?.length ?? 0).toBeGreaterThan(0);
    expect(body.daily?.weather_code?.length ?? 0).toBeGreaterThan(0);
  });
});
