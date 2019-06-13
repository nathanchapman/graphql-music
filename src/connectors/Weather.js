const { get } = require('got');

const format = weather => ({
  condition: weather.weather_state_name,
  high: weather.max_temp,
  low: weather.min_temp,
});

class Weather {
  async forecast({ datetime, venue }) {
    const date = new Date(datetime);
    const [year, month, day] = [
      date.getFullYear(), date.getMonth() + 1, date.getDate(),
    ];

    const { latitude, longitude } = venue;

    const location = {
      query: {
        lattlong: `${latitude},${longitude}`,
      },
      json: true,
    };

    const {
      body: [{ woeid }], // use the first city woeid returned from the search
    } = await get('https://www.metaweather.com/api/location/search/', location);

    const options = { json: true };
    const weather = y => m => d => `https://www.metaweather.com/api/location/${woeid}/${y}/${m}/${d}/`;

    // Forecasts only work 5-10 days in the future
    const { body: [forecasted] } = await get(
      weather(year)(month)(day),
      options,
    );

    if (forecasted) return format(forecasted);

    // Fallback to last year's weather report
    const { body: [historical] } = await get(
      weather(year - 1)(month)(day),
      options,
    );

    if (historical) return format(historical);

    throw new Error('Unable to retrieve weather data for event');
  }
}

module.exports = Weather;
