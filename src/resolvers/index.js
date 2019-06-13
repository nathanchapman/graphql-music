const resolvers = {
  Query: {
    artists: (_, args, ctx) => ctx.connectors.iTunes.artists(args),
    songs: (_, args, ctx) => ctx.connectors.iTunes.songs(args),
  },
  Artist: {
    songs: ({ name }, { limit }, ctx) => (
      ctx.connectors.iTunes.songs({ name, limit })
    ),
  },
  Song: {
    lyrics: (song, _, ctx) => ctx.connectors.Lyrics.bySong(song),
    tabs: ({ name, artistName }) => (
      `http://www.songsterr.com/a/wa/bestMatchForQueryString?s=${name}&a=${artistName}`
    ),
  },
};

module.exports = resolvers;
