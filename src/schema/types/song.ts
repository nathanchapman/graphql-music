import { ArtistRef, SongRef } from './refs.ts';

SongRef.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    artist: t.field({
      type: ArtistRef,
      nullable: true,
      resolve: ({ artistId }, _args, ctx) => (
        artistId ? ctx.loaders.artist.load(artistId) : null
      ),
    }),
    artistName: t.exposeString('artistName', {
      nullable: true,
      deprecationReason: 'Use `artist.name`.',
    }),
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
