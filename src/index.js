const { ApolloServer } = require('apollo-server');
const { importSchema } = require('graphql-import');
const resolvers = require('./resolvers');
const createConnectors = require('./connectors');

const typeDefs = importSchema('src/schema/schema.graphql');
const context = { connectors: createConnectors() };

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
