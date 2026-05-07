import { afterEach, describe, expect, test } from 'bun:test';
import { graphql } from 'graphql';
import { createContext } from '../../src/context.ts';
import { schema } from '../../src/schema/index.ts';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('artists query', () => {
  test('maps iTunes artists into GraphQL artists', async () => {
    globalThis.fetch = (async (url: Parameters<typeof fetch>[0]) => {
      expect(String(url)).toContain('term=The+Beatles');
      expect(String(url)).toContain('entity=allArtist');

      return Response.json({
        results: [
          {
            artistId: 136975,
            artistName: 'The Beatles',
            artistLinkUrl: 'https://music.apple.com/us/artist/the-beatles/136975',
            primaryGenreName: 'Rock',
          },
        ],
      });
    }) as typeof fetch;

    const result = await graphql({
      schema,
      source: `
        {
          artists(name: "The Beatles") {
            id
            name
            url
            genre
          }
        }
      `,
      contextValue: createContext(),
    });

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      artists: [
        {
          id: '136975',
          name: 'The Beatles',
          url: 'https://music.apple.com/us/artist/the-beatles/136975',
          genre: 'Rock',
        },
      ],
    });
  });
});
