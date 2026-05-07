import { describe, expect, test } from 'bun:test';
import { graphql } from 'graphql';
import { createContext } from '../../src/context.ts';
import { schema } from '../../src/schema/index.ts';

describe('greet query', () => {
  test('greets the world by default', async () => {
    const result = await graphql({
      schema,
      source: '{ greet }',
      contextValue: createContext(),
    });

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({ greet: 'Hello World' });
  });
});
