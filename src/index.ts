import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { createContext } from './context.ts';
import { schema } from './schema/index.ts';

const server = new ApolloServer({ schema });

const { url } = await startStandaloneServer(server, {
  context: async () => createContext(),
  listen: { port: 4000 },
});

console.log(`Server ready at ${url}`);
