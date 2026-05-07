import type { Event } from '../schema/types/refs.ts';

export interface EventSearchArgs {
  name: string;
  limit?: number | null;
}

export class BandsInTownConnector {
  async events({ name, limit = 10 }: EventSearchArgs): Promise<Event[]> {
    const url = new URL(`https://rest.bandsintown.com/artists/${encodeURIComponent(name)}/events`);
    url.search = new URLSearchParams({
      app_id: process.env.BANDSINTOWN_APP_ID || 'js_example',
    }).toString();

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Bandsintown request failed with ${response.status}`);
    }

    const body = (await response.json()) as Event[];

    return body.slice(0, limit ?? 10);
  }
}
