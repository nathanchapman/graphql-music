import DataLoader from 'dataloader';
import { createConnectors, type Connectors } from './connectors/index.ts';
import type { Artist } from './schema/types/refs.ts';

interface Loaders {
  artist: DataLoader<string, Artist | null>;
}

export interface GraphQLContext {
  connectors: Connectors;
  loaders: Loaders;
}

export const createContext = (): GraphQLContext => {
  const connectors = createConnectors();

  return {
    connectors,
    loaders: {
      artist: new DataLoader<string, Artist | null>((ids) => (
        connectors.iTunes.artistsByIds(ids)
      )),
    },
  };
};
