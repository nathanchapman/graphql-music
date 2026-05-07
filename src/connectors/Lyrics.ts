import type { Song } from '../schema/types/refs.ts';

interface LyricsResponse {
  lyrics?: string;
}

export class LyricsConnector {
  async bySong({ name, artistName }: Song): Promise<string | null> {
    if (!artistName) return null;

    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artistName)}/${encodeURIComponent(name)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) return null;

      const body = (await response.json()) as LyricsResponse;
      return body.lyrics ?? null;
    } catch (_error) {
      return null;
    }
  }
}
