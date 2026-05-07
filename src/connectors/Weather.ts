import type { Venue, Weather } from '../schema/types/refs.ts';

export interface WeatherForecastArgs {
  datetime: string;
  venue: Venue;
}

interface OpenMeteoArchiveResponse {
  daily?: {
    temperature_2m_max?: Array<number | null>;
    temperature_2m_min?: Array<number | null>;
    weather_code?: Array<number | null>;
  };
}

const weatherCodes = new Map<number, string>([
  [0, 'Clear sky'],
  [1, 'Mainly clear'],
  [2, 'Partly cloudy'],
  [3, 'Overcast'],
  [45, 'Fog'],
  [48, 'Depositing rime fog'],
  [51, 'Light drizzle'],
  [53, 'Moderate drizzle'],
  [55, 'Dense drizzle'],
  [61, 'Slight rain'],
  [63, 'Moderate rain'],
  [65, 'Heavy rain'],
  [71, 'Slight snow'],
  [73, 'Moderate snow'],
  [75, 'Heavy snow'],
  [80, 'Slight rain showers'],
  [81, 'Moderate rain showers'],
  [82, 'Violent rain showers'],
  [95, 'Thunderstorm'],
]);

const describeWeatherCode = (code: number | null | undefined): string | null => {
  if (code === null || code === undefined) return null;
  return weatherCodes.get(code) ?? 'Unknown';
};

export class WeatherConnector {
  async forecast({ datetime, venue }: WeatherForecastArgs): Promise<Weather> {
    if (!venue.latitude || !venue.longitude) {
      throw new Error('Unable to retrieve weather data for event');
    }

    const date = new Date(datetime).toISOString().slice(0, 10);
    const url = new URL('https://archive-api.open-meteo.com/v1/archive');
    url.search = new URLSearchParams({
      latitude: venue.latitude,
      longitude: venue.longitude,
      start_date: date,
      end_date: date,
      daily: 'temperature_2m_max,temperature_2m_min,weather_code',
      timezone: 'auto',
    }).toString();

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather request failed with ${response.status}`);
    }

    const body = (await response.json()) as OpenMeteoArchiveResponse;
    const daily = body.daily;

    if (!daily) {
      throw new Error('Unable to retrieve weather data for event');
    }

    return {
      condition: describeWeatherCode(daily.weather_code?.[0]),
      high: daily.temperature_2m_max?.[0] ?? null,
      low: daily.temperature_2m_min?.[0] ?? null,
    };
  }
}
