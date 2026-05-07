import type { Artist } from '../schema/types/artist.ts';
import type { Song } from '../schema/types/song.ts';

export interface ArtistSearchArgs {
  name: string;
  limit?: number | null;
}

export interface SongSearchArgs {
  name: string;
  limit?: number | null;
}

interface ITunesArtist {
  artistId: number;
  artistName: string;
  artistLinkUrl?: string;
  primaryGenreName?: string;
}

interface ITunesSong {
  artistName: string;
  collectionName?: string;
  trackId: number;
  trackName: string;
  trackViewUrl?: string;
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
  async artists({ name, limit = 5 }: ArtistSearchArgs): Promise<Artist[]> {
    const url = new URL('https://itunes.apple.com/search');
    url.search = new URLSearchParams({
      term: name,
      country: 'us',
      entity: 'allArtist',
      limit: String(limit ?? 5),
    }).toString();

    const body = await fetchJson<ITunesSearchResponse<ITunesArtist>>(url);

    return body.results.map((artist) => ({
      id: String(artist.artistId),
      name: artist.artistName,
      url: artist.artistLinkUrl ?? null,
      genre: artist.primaryGenreName ?? null,
    }));
  }

  async songs({ name, limit = 10 }: SongSearchArgs): Promise<Song[]> {
    const url = new URL('https://itunes.apple.com/search');
    url.search = new URLSearchParams({
      term: name,
      country: 'us',
      entity: 'song',
      limit: String(limit ?? 10),
    }).toString();

    const body = await fetchJson<ITunesSearchResponse<ITunesSong>>(url);

    return body.results.map((song) => ({
      id: String(song.trackId),
      name: song.trackName,
      artistName: song.artistName,
      album: song.collectionName ?? null,
      url: song.trackViewUrl ?? null,
    }));
  }
}
