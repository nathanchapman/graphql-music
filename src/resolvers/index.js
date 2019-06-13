const resolvers = {
  Query: {
    artists: (_, args, ctx) => ctx.connectors.iTunes.artists(args),
    songs: (_, args, ctx) => ctx.connectors.iTunes.songs(args),
  },
  Artist: {
    songs: ({ name }, { limit }, ctx) => (
      ctx.connectors.iTunes.songs({ name, limit })
    ),
    events: ({ name }, { limit }, ctx) => (
      ctx.connectors.BandsInTown.events({ name, limit })
    ),
  },
  Song: {
    lyrics: (song, _, ctx) => ctx.connectors.Lyrics.bySong(song),
    tabs: ({ name, artistName }) => (
      `http://www.songsterr.com/a/wa/bestMatchForQueryString?s=${name}&a=${artistName}`
    ),
  },
  Event: {
    time: event => new Date(event.datetime).toLocaleTimeString(),
    date: event => new Date(event.datetime).toLocaleDateString(),
    tickets: event => event.offers.find(offer => offer.type === 'Tickets'),
    weather: ({ datetime, venue }, _, ctx) => (
      ctx.connectors.Weather.forecast({ datetime, venue })
    ),
  },
  Weather: {
    temperature: ({ high, low }, { unit }) => {
      const fahrenheit = c => c * 9 / 5 + 32
      const h = unit === 'C' ? high : fahrenheit(high);
      const l = unit === 'C' ? low : fahrenheit(low);

      return {
        unit,
        high: Math.round(h),
        low: Math.round(l),
      };
    },
  },
};

module.exports = resolvers;
