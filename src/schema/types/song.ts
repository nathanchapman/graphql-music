import { builder } from '../builder.ts';

export interface Song {
  id: string;
  name: string;
  artistName: string | null;
  album: string | null;
  url: string | null;
  artistId?: string | null;
}

export const SongRef = builder.objectRef<Song>('Song').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    artistName: t.exposeString('artistName', { nullable: true }),
    album: t.exposeString('album', { nullable: true }),
    url: t.exposeString('url', { nullable: true }),
    lyrics: t.string({
      nullable: true,
      resolve: (song, _args, ctx) => ctx.connectors.lyrics.bySong(song),
    }),
    tabs: t.string({
      nullable: true,
      resolve: ({ name, artistName }) => (
        artistName
          ? `https://www.songsterr.com/a/wa/bestMatchForQueryString?s=${encodeURIComponent(name)}&a=${encodeURIComponent(artistName)}`
          : null
      ),
    }),
  }),
});
