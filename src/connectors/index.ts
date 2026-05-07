import { BandsInTownConnector } from './BandsInTown.ts';
import { ITunesConnector } from './iTunes.ts';
import { LyricsConnector } from './Lyrics.ts';
import { WeatherConnector } from './Weather.ts';

export const createConnectors = () => ({
  bandsInTown: new BandsInTownConnector(),
  iTunes: new ITunesConnector(),
  lyrics: new LyricsConnector(),
  weather: new WeatherConnector(),
});

export type Connectors = ReturnType<typeof createConnectors>;
