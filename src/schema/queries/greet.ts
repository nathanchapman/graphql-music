import { builder } from '../builder.ts';

builder.queryType({
  fields: (t) => ({
    greet: t.string({
      args: {
        name: t.arg.string(),
      },
      resolve: (_parent, { name }) => `Hello ${name ?? 'World'}`,
    }),
  }),
});
