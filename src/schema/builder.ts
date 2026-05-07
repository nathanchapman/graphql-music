import SchemaBuilder from '@pothos/core';
import type { GraphQLContext } from '../context.ts';

export const builder = new SchemaBuilder<{
  Context: GraphQLContext;
}>({});
