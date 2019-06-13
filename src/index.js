const { ApolloServer } = require('apollo-server');
const { importSchema } = require('graphql-import');
const DataLoader = require('dataloader');
const resolvers = require('./resolvers');
const createConnectors = require('./connectors');

const typeDefs = importSchema('src/schema/schema.graphql');
const context = { connectors: createConnectors() };

const context = () => {
  const connectors = createConnectors();
  const loaders = {
    artist: new DataLoader(IDs => Promise.resolve(
      IDs.map(id => connectors.iTunes.artist({ id })),
    )),
  };

  return { connectors, loaders };
};

const server = new ApolloServer({
  tracing: true,
  typeDefs,
  resolvers,
  context,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
