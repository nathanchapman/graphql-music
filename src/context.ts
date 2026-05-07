import { createConnectors, type Connectors } from './connectors/index.ts';

export interface GraphQLContext {
  connectors: Connectors;
}

export const createContext = (): GraphQLContext => ({
  connectors: createConnectors(),
});
