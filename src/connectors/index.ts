import { ITunesConnector } from './iTunes.ts';

export const createConnectors = () => ({
  iTunes: new ITunesConnector(),
});

export type Connectors = ReturnType<typeof createConnectors>;
