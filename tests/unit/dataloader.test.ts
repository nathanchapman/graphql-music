import { describe, expect, test } from 'bun:test';
import { graphql } from 'graphql';
import { createContext } from '../../src/context.ts';
import { schema } from '../../src/schema/index.ts';

describe('song artist DataLoader', () => {
  test('batches duplicate artist lookups within a request', async () => {
    const context = createContext();
    const lookupCalls: string[][] = [];

    context.connectors.iTunes.songs = async () => [
      {
        id: '1001',
        name: 'Come Together',
        artistName: 'The Beatles',
        album: 'Abbey Road',
        url: null,
        artistId: '136975',
      },
      {
        id: '1002',
        name: 'Something',
        artistName: 'The Beatles',
        album: 'Abbey Road',
        url: null,
        artistId: '136975',
      },
    ];

    context.connectors.iTunes.artistsByIds = async (ids) => {
      lookupCalls.push([...ids]);

      return ids.map((id) => ({
        id,
        name: 'The Beatles',
        url: null,
        genre: 'Rock',
      }));
    };

    const result = await graphql({
      schema,
      source: `
        {
          songs(name: "Abbey Road") {
            name
            artist {
              id
              name
            }
          }
        }
      `,
      contextValue: context,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      songs: [
        {
          name: 'Come Together',
          artist: {
            id: '136975',
            name: 'The Beatles',
          },
        },
        {
          name: 'Something',
          artist: {
            id: '136975',
            name: 'The Beatles',
          },
        },
      ],
    });
    expect(lookupCalls).toEqual([['136975']]);
  });
});
