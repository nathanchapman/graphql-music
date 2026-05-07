import { builder } from '../builder.ts';
import { ArtistRef } from '../types/artist.ts';

builder.queryFields((t) => ({
  artists: t.field({
    type: [ArtistRef],
    args: {
      name: t.arg.string({ required: true }),
      limit: t.arg.int({ defaultValue: 5 }),
    },
    resolve: (_parent, args, ctx) => ctx.connectors.iTunes.artists(args),
  }),
}));
