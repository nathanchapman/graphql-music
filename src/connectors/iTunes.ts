import type { Artist, Song } from '../schema/types/refs.ts';

export interface ArtistSearchArgs {
  name: string;
  limit?: number | null;
}

export interface ArtistLookupArgs {
  id: string;
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
  artistId: number;
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
  async artist({ id }: ArtistLookupArgs): Promise<Artist | null> {
    const [artist] = await this.artistsByIds([id]);
    return artist;
  }

  async artistsByIds(ids: readonly string[]): Promise<Array<Artist | null>> {
    if (ids.length === 0) return [];

    console.log(`looking up artist ${ids.join(',')}`);

    const url = new URL('https://itunes.apple.com/lookup');
    url.search = new URLSearchParams({ id: ids.join(',') }).toString();

    const body = await fetchJson<ITunesSearchResponse<ITunesArtist>>(url);
    const artistsById = new Map(
      body.results.map((artist) => [String(artist.artistId), artist]),
    );

    return ids.map((id) => {
      const artist = artistsById.get(id);

      if (!artist) return null;

      return {
        id: String(artist.artistId),
        name: artist.artistName,
        url: artist.artistLinkUrl ?? null,
        genre: artist.primaryGenreName ?? null,
      };
    });
  }

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
      artistId: String(song.artistId),
    }));
  }
}
