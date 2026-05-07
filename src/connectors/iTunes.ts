import type { Artist } from '../schema/types/artist.ts';

export interface ArtistSearchArgs {
  name: string;
}

interface ITunesArtist {
  artistId: number;
  artistName: string;
  artistLinkUrl?: string;
  primaryGenreName?: string;
}

interface ITunesSearchResponse<T> {
  results: T[];
}

const fetchJson = async <T>(url: URL): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`iTunes request failed with ${response.status}`);
  }

  return (await response.json()) as T;
};

export class ITunesConnector {
  async artists({ name }: ArtistSearchArgs): Promise<Artist[]> {
    const url = new URL('https://itunes.apple.com/search');
    url.search = new URLSearchParams({
      term: name,
      country: 'us',
      entity: 'allArtist',
    }).toString();

    const body = await fetchJson<ITunesSearchResponse<ITunesArtist>>(url);

    return body.results.map((artist) => ({
      id: String(artist.artistId),
      name: artist.artistName,
      url: artist.artistLinkUrl ?? null,
      genre: artist.primaryGenreName ?? null,
    }));
  }
}
