import { describe, expect, test } from 'bun:test';
import { graphql } from 'graphql';
import type { GraphQLContext } from '../../src/context.ts';
import { schema } from '../../src/schema/index.ts';

const context: GraphQLContext = {
  connectors: {
    iTunes: {
      artists: async ({ name }) => [
        { id: '136975', name, url: null, genre: 'Rock' },
      ],
      songs: async ({ name, limit }) => [
        {
          id: '1001',
          name: `${name} Song`,
          artistName: name,
          album: 'Workshop Album',
          url: 'https://example.com/song',
        },
      ].slice(0, limit ?? 10),
    },
    lyrics: {
      bySong: async () => 'Here are the lyrics',
    },
  },
};

describe('songs and artist relationships', () => {
  test('resolves songs with lyrics and tabs', async () => {
    const result = await graphql({
      schema,
      source: `
        {
          songs(name: "Here Comes The Sun", limit: 1) {
            id
            name
            artistName
            album
            url
            lyrics
            tabs
          }
        }
      `,
      contextValue: context,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      songs: [
        {
          id: '1001',
          name: 'Here Comes The Sun Song',
          artistName: 'Here Comes The Sun',
          album: 'Workshop Album',
          url: 'https://example.com/song',
          lyrics: 'Here are the lyrics',
          tabs: 'https://www.songsterr.com/a/wa/bestMatchForQueryString?s=Here%20Comes%20The%20Sun%20Song&a=Here%20Comes%20The%20Sun',
        },
      ],
    });
  });

  test('resolves songs under artists', async () => {
    const result = await graphql({
      schema,
      source: `
        {
          artists(name: "The Beatles", limit: 1) {
            name
            songs(limit: 1) {
              name
            }
          }
        }
      `,
      contextValue: context,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      artists: [
        {
          name: 'The Beatles',
          songs: [
            {
              name: 'The Beatles Song',
            },
          ],
        },
      ],
    });
  });
});
