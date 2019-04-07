const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    greet(name: String): String!
  }
`;

const resolvers = {
  Query: {
    greet: (_, { name }) => `Hello ${name || 'World'}`,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
