import { builder } from '../builder.ts';
import { SongRef } from './song.ts';

export interface Artist {
  id: string;
  name: string;
  url: string | null;
  genre: string | null;
}

export const ArtistRef = builder.objectRef<Artist>('Artist').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    url: t.exposeString('url', { nullable: true }),
    genre: t.exposeString('genre', { nullable: true }),
    songs: t.field({
      type: [SongRef],
      args: {
        limit: t.arg.int({ defaultValue: 10 }),
      },
      resolve: (artist, { limit }, ctx) => (
        ctx.connectors.iTunes.songs({ name: artist.name, limit })
      ),
    }),
  }),
});
