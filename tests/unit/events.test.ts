import { describe, expect, test } from 'bun:test';
import DataLoader from 'dataloader';
import { graphql } from 'graphql';
import type { GraphQLContext } from '../../src/context.ts';
import type { Event } from '../../src/schema/types/refs.ts';
import { schema } from '../../src/schema/index.ts';

const event: Event = {
  datetime: '2019-06-12T20:30:00.000Z',
  venue: {
    name: 'Austin Music Hall',
    latitude: '30.2672',
    longitude: '-97.7431',
    city: 'Austin',
    region: 'TX',
    country: 'United States',
  },
  offers: [
    {
      type: 'Tickets',
      status: 'available',
      url: 'https://example.com/tickets',
    },
  ],
  lineup: ['Blink-182'],
};

const context: GraphQLContext = {
  connectors: {
    bandsInTown: {
      events: async ({ limit }) => [event].slice(0, limit ?? 10),
    },
    iTunes: {
      artist: async () => null,
      artistsByIds: async () => [],
      artists: async ({ name }) => [
        { id: '1', name, url: null, genre: 'Rock' },
      ],
      songs: async () => [],
    },
    lyrics: {
      bySong: async () => null,
    },
    weather: {
      forecast: async () => ({
        condition: 'Clear sky',
        high: 25,
        low: 10,
      }),
    },
  },
  loaders: {
    artist: new DataLoader(async () => []),
  },
};

describe('events and weather', () => {
  test('resolves event fields from an artist', async () => {
    const result = await graphql({
      schema,
      source: `
        {
          artists(name: "Blink-182", limit: 1) {
            name
            events(limit: 1) {
              datetime
              venue {
                name
                city
                region
              }
              tickets {
                status
                url
              }
              lineup
              weather {
                condition
                temperature(unit: F) {
                  high
                  low
                  unit
                }
              }
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
          name: 'Blink-182',
          events: [
            {
              datetime: '2019-06-12T20:30:00.000Z',
              venue: {
                name: 'Austin Music Hall',
                city: 'Austin',
                region: 'TX',
              },
              tickets: {
                status: 'available',
                url: 'https://example.com/tickets',
              },
              lineup: ['Blink-182'],
              weather: {
                condition: 'Clear sky',
                temperature: {
                  high: 77,
                  low: 50,
                  unit: 'F',
                },
              },
            },
          ],
        },
      ],
    });
  });
});
