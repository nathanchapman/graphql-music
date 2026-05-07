import { builder } from '../builder.ts';
import { SongRef } from '../types/song.ts';

builder.queryFields((t) => ({
  songs: t.field({
    type: [SongRef],
    args: {
      name: t.arg.string({ required: true }),
      limit: t.arg.int({ defaultValue: 10 }),
    },
    resolve: (_parent, args, ctx) => ctx.connectors.iTunes.songs(args),
  }),
}));
