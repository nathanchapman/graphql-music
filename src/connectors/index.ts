import { ITunesConnector } from './iTunes.ts';
import { LyricsConnector } from './Lyrics.ts';

export const createConnectors = () => ({
  iTunes: new ITunesConnector(),
  lyrics: new LyricsConnector(),
});

export type Connectors = ReturnType<typeof createConnectors>;
