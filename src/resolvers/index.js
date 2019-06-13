const resolvers = {
  Query: {
    artists: (_, args, ctx) => ctx.connectors.iTunes.artists(args),
  },
};

module.exports = resolvers;
