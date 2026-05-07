import { builder } from '../builder.ts';

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
  }),
});
