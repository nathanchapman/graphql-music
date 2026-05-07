# 🎸 graphql-music

For this introductory GraphQL workshop, we'll be building an API with music data to support clients that display information about artists, songs, lyrics, tabs (sheet music), and concerts 🎵

This workshop assumes you already have a basic knowledge of [what GraphQL is](https://www.howtographql.com/basics/0-introduction/) and [how to write code in JavaScript or TypeScript](https://www.typescriptlang.org/docs/).

This workshop typically takes about 2 to 2.5 hours to complete. I've broken it down into sections to make it easier to take breaks and jump back in whenever you're ready. To start at the beginning of any given section, just `git checkout` the branch with that name (i.e. `part1`, `part2`, etc.)

The checkpoint branches build on each other in order:

```text
main -> part1 -> part2 -> part3 -> part4 -> complete
```

## Contents

### Setup

> Starting branch: [main](https://github.com/nathanchapman/graphql-music/tree/main)

* [Setup](#setup)
* [Organize](#organize)

### Part 1

> Starting branch: [part1](https://github.com/nathanchapman/graphql-music/tree/part1)

* [Creating your first Query](#creating-your-first-query)
* [Creating your first Resolver](#creating-your-first-resolver)
* [Let's get some Context](#lets-get-some-context)
* [Creating your first Connector](#creating-your-first-connector)

### Part 2

> Starting branch: [part2](https://github.com/nathanchapman/graphql-music/tree/part2)

* [Song Data](#song-data)
* [Limits](#limits)
* [Graph Relationships](#graph-relationships)
* [Lyrics and Tabs](#lyrics-and-tabs)

### Part 3

> Starting branch: [part3](https://github.com/nathanchapman/graphql-music/tree/part3)

* [Events](#events)
* [Weather](#weather)

### Part 4

> Starting branch: [part4](https://github.com/nathanchapman/graphql-music/tree/part4)

* [More Graph Relationships](#more-graph-relationships)
* [N+1 Queries](#n1-queries)
* [DataLoader (Batching & Caching)](#dataloader-batching--caching)

### Conclusion

* [Conclusion](#%F0%9F%9A%80-conclusion)

## Setup

Clone the project & `cd` into it

```bash
$ git clone git@github.com:nathanchapman/graphql-music.git
$ cd graphql-music
```

Install the dependencies with [Bun](https://bun.sh)

```bash
$ bun install
```

This workshop uses [Apollo Server](https://www.apollographql.com/docs/apollo-server/), [GraphQL.js](https://github.com/graphql/graphql-js), TypeScript, and [Pothos](https://pothos-graphql.dev/) 🚀

Pothos is the biggest change from the original version of this workshop. Instead of writing GraphQL SDL in `.graphql` files and then separately writing resolver maps in JavaScript, Pothos lets us define the GraphQL schema and the resolver for each field in one TypeScript location. That keeps the public API shape and the implementation close together, and TypeScript can check that our resolvers actually return the data promised by the schema.

Take a look at the boilerplate code in `src/index.ts`

```ts
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
```

The demo query is defined in `src/schema/queries/greet.ts`

```ts
import { builder } from '../builder.ts';

builder.queryType({
  fields: (t) => ({
    greet: t.string({
      args: {
        name: t.arg.string(),
      },
      resolve: (_parent, { name }) => `Hello ${name ?? 'World'}`,
    }),
  }),
});
```

At this point, you should be able to run `bun start` to start the server. Your server will automatically restart each time we make changes. Navigate to <http://localhost:4000> to see Apollo Sandbox. Apollo Sandbox is a graphical, interactive, in-browser GraphQL IDE where you can explore the schema, craft queries, and view response data.

At any point during this workshop, you can view the current schema in Sandbox. The development server will restart when you make changes to files in the project and Sandbox will automatically pick those up, so there's no need to refresh the page.

We can test our demo server by sending our first query in Sandbox.

```graphql
{
  greet
}
```

The response from a GraphQL server will be [JSON](https://www.w3schools.com/whatis/whatis_json.asp) in the same shape as the query you sent.

```json
{
  "data": {
    "greet": "Hello World"
  }
}
```

You can also run the automated tests at any point:

```bash
$ bun test
$ bun run typecheck
```

`bun test` runs the unit tests in `tests/unit`. Live API smoke tests live in `tests/integration` so they can run periodically in CI without slowing down normal workshop development:

```bash
$ bun run test:integration
```

## Organize

Let's organize things a little better!

The starter project already separates the server, context, schema builder, and schema modules:

* `src/index.ts` creates the Apollo Server.
* `src/context.ts` creates the GraphQL context object.
* `src/schema/builder.ts` creates the Pothos schema builder.
* `src/schema/index.ts` imports all schema modules and exports the final schema.
* `src/schema/queries/greet.ts` defines the starter `greet` query.

Your `src/schema/builder.ts` should look like this:

```ts
import SchemaBuilder from '@pothos/core';
import type { GraphQLContext } from '../context.ts';

export const builder = new SchemaBuilder<{
  Context: GraphQLContext;
}>({});
```

This is where TypeScript starts connecting your schema to the rest of the application. The `Context` type tells Pothos which properties are available as the third resolver argument.

Your `src/schema/index.ts` should look like this:

```ts
import './queries/greet.ts';
import { builder } from './builder.ts';

export const schema = builder.toSchema();
```

The imports in this file are important. Pothos schema modules register fields with the shared builder when they are imported, then `builder.toSchema()` creates the GraphQL schema Apollo Server uses.

At this point, your changes should be in line with the starting branch for [part1](https://github.com/nathanchapman/graphql-music/tree/part1).

## Creating your first Query

We know our clients will need information about `artist`s. Let's define what an artist is by adding an `Artist` type in a new file `src/schema/types/artist.ts`.

```ts
import { builder } from '../builder.ts';

export interface Artist {
  id: string;
  name: string;
  url: string | null;
  genre: string | null;
}

export const ArtistRef = builder.objectRef<Artist>('Artist').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    url: t.exposeString('url', { nullable: true }),
    genre: t.exposeString('genre', { nullable: true }),
  }),
});
```

***Note:*** These fields should be determined by **both** the needs of the clients and capabilities of our backend APIs.

Now let's add our first Query in a new file `src/schema/queries/artists.ts`

```ts
import { builder } from '../builder.ts';
import { ArtistRef } from '../types/artist.ts';

builder.queryFields((t) => ({
  artists: t.field({
    type: [ArtistRef],
    args: {
      name: t.arg.string({ required: true }),
    },
    resolve: (_parent, { name }) => [
      { id: 'fake', name, url: null, genre: null },
    ],
  }),
}));
```

This query will allow our clients to search for artists and get an array of results!

Notice how the `artists` field has both a `type` and a `resolve` function in the same object? That's Pothos helping us define the GraphQL schema and resolver together. The old workshop used SDL files for the schema and a separate resolver map for the implementation. With Pothos, TypeScript can check the resolver against the schema while we're writing it.

There are [several ways to represent a GraphQL schema](https://blog.apollographql.com/three-ways-to-represent-your-graphql-schema-a41f4175100d), including: using the [GraphQL.js](https://github.com/graphql/graphql-js#using-graphqljs) `GraphQLSchema` and `GraphQLObjectType` classes, [GraphQL Schema Definition Language](https://www.prisma.io/blog/graphql-sdl-schema-definition-language-6755bcb9ce51) (SDL), or code-first schema builders like Pothos. We'll be using Pothos in this workshop because it keeps the schema and resolvers together while preserving strong TypeScript types.

Further, you can represent GraphQL SDL in a number of ways, including: strings, `graphql-tag` (`gql`), and directly in `.graphql` or `.gql` files. Any of these approaches work just fine. Pothos gives us a different code-first approach: our TypeScript code is the source of truth and Pothos builds the GraphQL schema from it.

Now we have our type definitions for what an `Artist` is and how to `Query` for one. Awesome! But how do we actually fetch and return data?

## Creating your first Resolver

`Resolvers` are functions that are executed by our server to resolve the data for our schema. In Pothos, each field's resolver lives next to the field definition. We can define a resolver for any field on any type, but often times we're able to rely on the default resolver for trivial resolutions like returning a named property on an object.

The resolver for our first query is the `resolve` function inside `artists`.

```ts
builder.queryFields((t) => ({
  artists: t.field({
    type: [ArtistRef],
    args: {
      name: t.arg.string({ required: true }),
    },
    resolve: (_parent, { name }) => [
      { id: 'fake', name, url: null, genre: null },
    ],
  }),
}));
```

Make sure `src/schema/index.ts` imports the new type and query files:

```ts
import './types/artist.ts';
import './queries/artists.ts';
import './queries/greet.ts';
import { builder } from './builder.ts';

export const schema = builder.toSchema();
```

Open Sandbox at <http://localhost:4000> and send a query for `artists`

```graphql
{
  artists(name: "Fake") {
    name
  }
}
```

You'll receive fake data because we're just mocking an array with one object as the return value of the resolver, but now we have something executing!

*Notice* that if you ask for any non-nullable fields like `id`, the fake resolver still needs to return those fields. In the old JavaScript version, you could forget `id` and only discover the mistake at runtime with an error like `Cannot return null for non-nullable field Artist.id`. With TypeScript and Pothos, the `Artist` interface makes that contract visible in code, so we can catch more of these mismatches before the server runs. GraphQL still enforces nullability at runtime, and TypeScript helps us stay honest while implementing it.

## Let's get some Context

Resolvers take in 4 parameters: `root`, `args`, `context`, and `info`, respectively.

* `root` the value of the previous execution level (more on `execution levels` later)
* `args` any arguments passed directly into the given field
* `context` an object containing any data that should be made available to all resolvers (think logging functions, session information, data sources used to fetch information, etc.)
* `info` an object containing information about the query such as the selection set, the AST of the query, parent information, etc. This parameter isn't used as often, and I'd consider it as intended for more advanced cases.

In Pothos, the same values are available to field resolvers:

```ts
resolve: (root, args, context, info) => {
  // ...
}
```

## Creating your first Connector

Most GraphQL services follow some sort of `connector` pattern for data access. The idea here is to have a layer on top of a database/backend driver that has GraphQL-specific error handling, logging, batching, and caching. We'll touch more on these topics later. For now, let's just think of it as our sources for fetching data.

You guessed it! The connector will go on the `context` object passed into all resolvers.

Let's create a new folder `src/connectors` with an `index.ts`

```ts
import { ITunesConnector } from './iTunes.ts';

export const createConnectors = () => ({
  iTunes: new ITunesConnector(),
});

export type Connectors = ReturnType<typeof createConnectors>;
```

In our `src/context.ts`, let's import that file and update our context object

```ts
import { createConnectors, type Connectors } from './connectors/index.ts';

export interface GraphQLContext {
  connectors: Connectors;
}

export const createContext = (): GraphQLContext => ({
  connectors: createConnectors(),
});
```

Let's add a new file, `src/connectors/iTunes.ts`

```ts
import type { Artist } from '../schema/types/artist.ts';

export interface ArtistSearchArgs {
  name: string;
}

interface ITunesArtist {
  artistId: number;
  artistName: string;
  artistLinkUrl?: string;
  primaryGenreName?: string;
}

interface ITunesSearchResponse<T> {
  results: T[];
}

const fetchJson = async <T>(url: URL): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`iTunes request failed with ${response.status}`);
  }

  return (await response.json()) as T;
};

export class ITunesConnector {
  async artists({ name }: ArtistSearchArgs): Promise<Artist[]> {
    const url = new URL('https://itunes.apple.com/search');
    url.search = new URLSearchParams({
      term: name,
      country: 'us',
      entity: 'allArtist',
    }).toString();

    const body = await fetchJson<ITunesSearchResponse<ITunesArtist>>(url);

    return body.results.map((artist) => ({
      name: artist.artistName,
      url: artist.artistLinkUrl ?? null,
      id: String(artist.artistId),
      genre: artist.primaryGenreName ?? null,
    }));
  }
}
```

We'll need to make an HTTP request to the iTunes API in our `iTunes` connector. Since we're using Bun and modern TypeScript, we can use the built-in `fetch` API instead of installing a separate HTTP request library.

*Notice* that once we get the results, we're remapping the iTunes API results into objects that match our GraphQL type for `Artist`.

Now we can go back to `src/schema/queries/artists.ts` and consume this connector from our `context`

```ts
builder.queryFields((t) => ({
  artists: t.field({
    type: [ArtistRef],
    args: {
      name: t.arg.string({ required: true }),
    },
    resolve: (_parent, args, ctx) => ctx.connectors.iTunes.artists(args),
  }),
}));
```

And that's it!

You can open [Sandbox](http://localhost:4000) again and send a query for `artists`:

```graphql
{
  artists(name: "The Beatles") {
    id
    name
    url
    genre
  }
}
```

It works! 😎

At this point, your changes should be in line with the starting branch for [part2](https://github.com/nathanchapman/graphql-music/tree/part2).

## Song Data

Create a `Song` type in a new file `src/schema/types/song.ts`.

```ts
import { builder } from '../builder.ts';

export interface Song {
  id: string;
  name: string;
  artistName: string | null;
  album: string | null;
  url: string | null;
  artistId?: string | null;
}

export const SongRef = builder.objectRef<Song>('Song').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    artistName: t.exposeString('artistName', { nullable: true }),
    album: t.exposeString('album', { nullable: true }),
    url: t.exposeString('url', { nullable: true }),
  }),
});
```

and add a new `Query` for `songs` in a new file `src/schema/queries/songs.ts`

```ts
import { builder } from '../builder.ts';
import { SongRef } from '../types/song.ts';

builder.queryFields((t) => ({
  songs: t.field({
    type: [SongRef],
    args: {
      name: t.arg.string({ required: true }),
    },
    resolve: (_parent, args, ctx) => ctx.connectors.iTunes.songs(args),
  }),
}));
```

Let's add another method to the `iTunes` connector

```ts
async songs({ name }: SongSearchArgs): Promise<Song[]> {
  const url = new URL('https://itunes.apple.com/search');
  url.search = new URLSearchParams({
    term: name,
    country: 'us',
    entity: 'song',
  }).toString();

  const body = await fetchJson<ITunesSearchResponse<ITunesSong>>(url);

  return body.results.map((song) => ({
    name: song.trackName,
    artistName: song.artistName,
    album: song.collectionName ?? null,
    url: song.trackViewUrl ?? null,
    id: String(song.trackId),
  }));
}
```

*Notice* we're remapping the results again since the iTunes API definition of a song isn't exactly the same as the `Song` type definition we're using in our GraphQL API.

Now we just have to import the new schema files from `src/schema/index.ts`

```ts
import './types/artist.ts';
import './types/song.ts';
import './queries/artists.ts';
import './queries/songs.ts';
import './queries/greet.ts';
import { builder } from './builder.ts';

export const schema = builder.toSchema();
```

Open [Sandbox](http://localhost:4000) again and send a query for `songs`

```graphql
{
  songs(name: "Abbey Road") {
    id
    name
    artistName
    album
    url
  }
}
```

Wow.. there are a lot more results than our clients need to display! This large payload will have to be downloaded and parsed by the client whether they use all of the results or not. Let's fix that!

## Limits

Let's add some limiting to our queries so the clients can specify how many results they need.

In your Pothos query fields, add limit arguments with some reasonable defaults

```ts
artists: t.field({
  type: [ArtistRef],
  args: {
    name: t.arg.string({ required: true }),
    limit: t.arg.int({ defaultValue: 5 }),
  },
  resolve: (_parent, args, ctx) => ctx.connectors.iTunes.artists(args),
})
```

```ts
songs: t.field({
  type: [SongRef],
  args: {
    name: t.arg.string({ required: true }),
    limit: t.arg.int({ defaultValue: 10 }),
  },
  resolve: (_parent, args, ctx) => ctx.connectors.iTunes.songs(args),
})
```

In your `iTunes` connector, add `limit` in **both** the `artists` and `songs` method signatures and to the URL search params

```ts
async artists({ name, limit = 5 }: ArtistSearchArgs): Promise<Artist[]> {
  const url = new URL('https://itunes.apple.com/search');
  url.search = new URLSearchParams({
    term: name,
    country: 'us',
    entity: 'allArtist',
    limit: String(limit),
  }).toString();
  // ...
}
```

Now the clients can specify a limit or rely on the defaults we set in our schema

```graphql
{
  songs(name: "Abbey Road", limit: 1) {
    id
    name
    artistName
    album
    url
  }
}
```

## Graph Relationships

Now we can request information about artists and songs, but they're separate.

Our clients would have to send queries like this for artist info and their songs:

```graphql
{
  artists(name: "The Beatles", limit: 1) {
    id
    name
    url
    genre
  }
  songs(name: "The Beatles") {
    id
    name
    artistName
    album
    url
  }
}
```

We could improve this slightly by using `query variables`

```graphql
query artistsWithSongs($name: String!) {
  artists(name: $name, limit: 1) {
    id
    name
    url
    genre
  }
  songs(name: $name) {
    id
    name
    artistName
    album
    url
  }
}
```

```json
{
  "name": "The Beatles"
}
```

But there's still no direct relationship between an `Artist` and their `songs`.

Shouldn't we be able to query for `songs` under an `artist` and vice versa?

In your `Artist` type, add a `songs` field

```ts
export const ArtistRef = builder.objectRef<Artist>('Artist').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    url: t.exposeString('url', { nullable: true }),
    genre: t.exposeString('genre', { nullable: true }),
    songs: t.field({
      type: [SongRef],
      args: {
        limit: t.arg.int({ defaultValue: 10 }),
      },
      resolve: (artist, { limit }, ctx) => (
        ctx.connectors.iTunes.songs({ name: artist.name, limit })
      ),
    }),
  }),
});
```

Our `Query.artists` resolver doesn't return the necessary data for `songs`. That's okay! In the next `execution level`, the `Artist.songs` resolver is called on the `Artist` object to fetch this data.

This new field resolver is almost identical to the `Query.songs` resolver, but the `name` comes from the root object `Artist` (once it's resolved) instead of a field argument.

Now our clients can send more concise queries for artist info and their songs

```graphql
{
  artists(name: "The Beatles") {
    id
    name
    url
    genre
    songs {
      id
      name
      artistName
      album
      url
    }
  }
}
```

## Lyrics and Tabs

There's a new feature coming out soon and the clients need to get data for lyrics and tabs (sheet music), but neither of those are supported by the iTunes API.

Go ahead and add these fields to the `Song` type

```ts
export const SongRef = builder.objectRef<Song>('Song').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    artistName: t.exposeString('artistName', { nullable: true }),
    album: t.exposeString('album', { nullable: true }),
    url: t.exposeString('url', { nullable: true }),
    lyrics: t.string({
      nullable: true,
      resolve: (song, _args, ctx) => ctx.connectors.lyrics.bySong(song),
    }),
    tabs: t.string({
      nullable: true,
      resolve: ({ name, artistName }) => (
        artistName
          ? `https://www.songsterr.com/a/wa/bestMatchForQueryString?s=${encodeURIComponent(name)}&a=${encodeURIComponent(artistName)}`
          : null
      ),
    }),
  }),
});
```

Add a new file `src/connectors/Lyrics.ts`

```ts
import type { Song } from '../schema/types/song.ts';

interface LyricsResponse {
  lyrics?: string;
}

export class LyricsConnector {
  async bySong({ name, artistName }: Song): Promise<string | null> {
    if (!artistName) return null;

    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artistName)}/${encodeURIComponent(name)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) return null;

      const body = (await response.json()) as LyricsResponse;
      return body.lyrics ?? null;
    } catch (_error) {
      return null;
    }
  }
}
```

Let's import it in `src/connectors/index.ts`

```ts
import { ITunesConnector } from './iTunes.ts';
import { LyricsConnector } from './Lyrics.ts';

export const createConnectors = () => ({
  iTunes: new ITunesConnector(),
  lyrics: new LyricsConnector(),
});

export type Connectors = ReturnType<typeof createConnectors>;
```

We have lyrics! 🎤

What about tabs?

[Songsterr](https://www.songsterr.com/) provides tabs and an API, but they also have direct URLs we can use for loading sheet music by artist name and song name. That's all our clients needed! In this case, we don't even need a connector or an API call.

Open [Sandbox](http://localhost:4000) again and send a query for `songs` with lyrics and tabs

```graphql
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
```

🎼🎼🎼🎼

At this point, your changes should be in line with the starting branch for [part3](https://github.com/nathanchapman/graphql-music/tree/part3).

## Events

Let's add some `Event`-related types to our schema (think concerts, festivals, etc.)

```ts
export interface Ticket {
  status: string | null;
  url: string | null;
  type?: string | null;
}

export interface Venue {
  name: string | null;
  latitude: string | null;
  longitude: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
}

export interface Event {
  datetime: string;
  venue: Venue | null;
  offers: Ticket[];
  lineup: string[] | null;
}
```

Add Pothos object types for `Event`, `Ticket`, and `Venue` in `src/schema/types/event.ts`

```ts
export const EventRef = builder.objectRef<Event>('Event').implement({
  fields: (t) => ({
    datetime: t.string({
      resolve: (event) => new Date(event.datetime).toISOString(),
    }),
    venue: t.field({
      type: VenueRef,
      nullable: true,
      resolve: (event) => event.venue,
    }),
    tickets: t.field({
      type: TicketRef,
      nullable: true,
      resolve: (event) => event.offers.find((offer) => offer.type === 'Tickets') ?? null,
    }),
    lineup: t.exposeStringList('lineup', { nullable: true }),
  }),
});
```

and add an `events` field under the `Artist` type

```ts
events: t.field({
  type: [EventRef],
  nullable: true,
  args: {
    limit: t.arg.int({ defaultValue: 10 }),
  },
  resolve: (artist, { limit }, ctx) => (
    ctx.connectors.bandsInTown.events({ name: artist.name, limit })
  ),
}),
```

We'll need a connector for event data. For this we'll be using the [BandsInTown API](https://app.swaggerhub.com/apis/Bandsintown/PublicAPI/3.0.0#/).

Add a new file `src/connectors/BandsInTown.ts`

```ts
import type { Event } from '../schema/types/event.ts';

export interface EventSearchArgs {
  name: string;
  limit?: number | null;
}

export class BandsInTownConnector {
  async events({ name, limit = 10 }: EventSearchArgs): Promise<Event[]> {
    const url = new URL(`https://rest.bandsintown.com/artists/${encodeURIComponent(name)}/events`);
    url.search = new URLSearchParams({
      app_id: process.env.BANDSINTOWN_APP_ID || 'js_example',
    }).toString();

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Bandsintown request failed with ${response.status}`);
    }

    const body = (await response.json()) as Event[];

    return body.slice(0, limit ?? 10);
  }
}
```

Bandsintown currently requires an `app_id`. The workshop uses their public example `js_example` value by default so the exercise works without setup, but you can set `BANDSINTOWN_APP_ID` if you have your own API key.

and import it in `src/connectors/index.ts`

```ts
import { BandsInTownConnector } from './BandsInTown.ts';
import { ITunesConnector } from './iTunes.ts';
import { LyricsConnector } from './Lyrics.ts';

export const createConnectors = () => ({
  bandsInTown: new BandsInTownConnector(),
  iTunes: new ITunesConnector(),
  lyrics: new LyricsConnector(),
});
```

Open [Sandbox](http://localhost:4000) again and send a query for `artists` with events

```graphql
{
  artists(name: "Blink-182", limit: 1) {
    name
    events {
      datetime
      venue {
        name
        latitude
        longitude
        city
        region
        country
      }
      tickets {
        status
        url
      }
      lineup
    }
  }
}
```

In the old resolver-map version of this workshop, it was easy to add date/time fields to the GraphQL schema without implementing resolvers for them, which caused errors like `Cannot return null for non-nullable field Event.date`. With Pothos, the resolver is defined right next to the field. We'll expose one `datetime` field in UTC/Zulu format so clients get stable values regardless of the server's locale or timezone:

```ts
datetime: t.string({
  resolve: (event) => new Date(event.datetime).toISOString(),
}),
```

The response from `BandsInTown` has an `offers` array instead of a `tickets` field.

```ts
tickets: t.field({
  type: TicketRef,
  nullable: true,
  resolve: (event) => event.offers.find((offer) => offer.type === 'Tickets') ?? null,
}),
```

No more errors or `null` — awesome!

## Weather

Now let's add some `Weather` types to our schema so we can fetch the weather conditions on the day of an `Event`

```ts
export type TemperatureUnit = 'C' | 'F';

export interface Weather {
  condition: string | null;
  high: number | null;
  low: number | null;
}
```

```ts
builder.enumType('TemperatureUnit', {
  values: ['C', 'F'] as const,
});

export const WeatherRef = builder.objectRef<Weather>('Weather').implement({
  fields: (t) => ({
    condition: t.exposeString('condition', { nullable: true }),
    temperature: t.field({
      type: TemperatureRef,
      nullable: true,
      args: {
        unit: t.arg({ type: 'TemperatureUnit', defaultValue: 'F' }),
      },
      resolve: ({ high, low }, { unit }) => {
        if (high === null || low === null) return null;

        const fahrenheit = (celsius: number) => celsius * 9 / 5 + 32;
        const h = unit === 'C' ? high : fahrenheit(high);
        const l = unit === 'C' ? low : fahrenheit(low);

        return {
          unit,
          high: Math.round(h),
          low: Math.round(l),
        };
      },
    }),
  }),
});
```

Under the `Event` type, add a `weather` field

```ts
weather: t.field({
  type: WeatherRef,
  nullable: true,
  resolve: ({ datetime, venue }, _args, ctx) => (
    venue ? ctx.connectors.weather.forecast({ datetime, venue }) : null
  ),
}),
```

This workshop used to consume the Yahoo Weather API until the public version was removed in January 2019. It was here that I'd point out that Yahoo went as far as to create their own custom query language for interacting with their APIs called `yql`.

You'd pass the `yql` as part of the URL query string like so

```js
const url = 'https://query.yahooapis.com/v1/public/yql?q='
  .concat('select * from weather.forecast where woeid in ')
  .concat(`(select woeid from geo.places(1) where text="${city}, ${region}") `)
  .concat(`and u='${unit.toLowerCase()}'&format=json`)
  .concat('&env=store://datatables.org/alltableswithkeys'),
```

🤦‍ Not ideal...

Any ideas for a technology that would greatly simplify their API? 💡

All we're asking for is forecast data for a `city` and `region`.

What if we could send them a GraphQL query instead?

```graphql
{
  forecast(city: $city, region: $region, unit: $unit) {
    high
    low
    condition
  }
}
```

Maybe some day.. 🤞

The old version of this workshop used MetaWeather next, but that public API is no longer available. We'll use [Open-Meteo](https://open-meteo.com/) instead because it does not require an API key for this workshop.

Add a new connector `src/connectors/Weather.ts`

```ts
export class WeatherConnector {
  async forecast({ datetime, venue }: WeatherForecastArgs): Promise<Weather> {
    const date = new Date(datetime).toISOString().slice(0, 10);
    const latitude = venue.latitude ?? '';
    const longitude = venue.longitude ?? '';

    const url = new URL('https://archive-api.open-meteo.com/v1/archive');
    url.search = new URLSearchParams({
      latitude,
      longitude,
      start_date: date,
      end_date: date,
      daily: 'temperature_2m_max,temperature_2m_min,weather_code',
      timezone: 'auto',
    }).toString();

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather request failed with ${response.status}`);
    }

    const body = (await response.json()) as OpenMeteoArchiveResponse;

    return {
      condition: describeWeatherCode(body.daily.weather_code[0] ?? null),
      high: body.daily.temperature_2m_max[0] ?? null,
      low: body.daily.temperature_2m_min[0] ?? null,
    };
  }
}
```

Initialize your `Weather` connector in `src/connectors/index.ts` like you've done with the other connectors.

*Notice* we're using the `datetime` from the root object (`Event` returned by BandsInTown) even though we didn't publicly expose that field in our GraphQL API. GraphQL gives us the entire object returned from the previous execution level as `root` (the first argument). This is a great way to pass data from a root object to the next execution level without exposing the implementation details of your API!

Open [Sandbox](http://localhost:4000) again and send a query for `artists` with `events` and `weather`

```graphql
{
  artists(name: "Blink-182", limit: 1) {
    name
    events(limit: 1) {
      weather {
        temperature {
          high
          low
          unit
        }
        condition
      }
      datetime
      venue {
        name
        latitude
        longitude
        city
        region
        country
      }
      tickets {
        status
        url
      }
      lineup
    }
  }
}
```

The weather API returns temperatures in Celsius. This doesn't quite line up with our schema! They should be under the `Weather.temperature` object and return the correct values for both Celsius and Fahrenheit. The `Weather.temperature` resolver uses the `high` and `low` fields from the `Weather` object and handles conversion.

```ts
temperature: t.field({
  type: TemperatureRef,
  nullable: true,
  args: {
    unit: t.arg({ type: 'TemperatureUnit', defaultValue: 'F' }),
  },
  resolve: ({ high, low }, { unit }) => {
    if (high === null || low === null) return null;

    const fahrenheit = (celsius: number) => celsius * 9 / 5 + 32;
    const h = unit === 'C' ? high : fahrenheit(high);
    const l = unit === 'C' ? low : fahrenheit(low);

    return {
      unit,
      high: Math.round(h),
      low: Math.round(l),
    };
  },
}),
```

Try the query again and make sure to prepare for the weather! ☔️⛅️😎

Our clients can still get `null` for `weather`, but that's only if the weather API fails to return data. This is a lot less likely, but if it does fail, the clients will also get an error telling them about the issue.

```json
{
  "data": {
    "artists": [
      {
        "name": "Blink-182",
        "events": [
          {
            "weather": null,
            "datetime": "2019-06-12T20:30:00.000Z"
          }
        ]
      }
    ]
  },
  "errors": [
    {
      "message": "Unable to retrieve weather data for event",
      "path": ["artists", 0, "events", 0, "weather"]
    }
  ]
}
```

Errors are very useful! We can use errors to intelligently inform our clients about issues with provided inputs, API degradations, and many other types of issues. Remember to not expose sensitive information like unexpected errors, stacktraces, etc. in production! See [Apollo's Error handling guide](https://www.apollographql.com/docs/apollo-server/data/errors/) for more information.

At this point, your changes should be in line with the starting branch for [part4](https://github.com/nathanchapman/graphql-music/tree/part4).

## More Graph Relationships

Our clients want to be able to search for songs and get more artist information back than just `artistName`.

Remember earlier when we set up a graph relationship between artists and their songs?

We should create a similar relationship between a `Song` and its `Artist`.

In your `Song` type, add a field for `artist`

```ts
artist: t.field({
  type: ArtistRef,
  nullable: true,
  resolve: ({ artistId }, _args, ctx) => (
    artistId ? ctx.connectors.iTunes.artist({ id: artistId }) : null
  ),
}),
```

We'll need to modify our `songs` method in our `iTunes` connector to return the artist's ID

```ts
return {
  // ...
  artistId: String(song.artistId),
};
```

Let's add another method to our `iTunes` connector to lookup an artist by ID

```ts
async artist({ id }: ArtistLookupArgs): Promise<Artist | null> {
  const url = new URL('https://itunes.apple.com/lookup');
  url.search = new URLSearchParams({ id }).toString();

  console.log(`looking up artist ${id}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`iTunes request failed with ${response.status}`);
  }

  const body = (await response.json()) as ITunesSearchResponse<ITunesArtist>;
  const artist = body.results[0];

  if (!artist) return null;

  return {
    name: artist.artistName,
    url: artist.artistLinkUrl ?? null,
    id: String(artist.artistId),
    genre: artist.primaryGenreName ?? null,
  };
}
```

Lastly, let's deprecate the old `artistName` field in our schema so that new clients won't know about that field. It will still work as expected for older clients that may still be requesting it and you should keep it around until you can confirm it's not being called anymore (think mobile apps that haven't been updated yet!)

```ts
artistName: t.exposeString('artistName', {
  nullable: true,
  deprecationReason: 'Use `artist.name`.',
}),
```

Open [Sandbox](http://localhost:4000) again and send a query for `songs` with artist details

```graphql
{
  songs(name: "Sun") {
    id
    name
    artistName
    album
    url
    artist {
      id
      name
      url
      genre
    }
  }
}
```

You should notice a new deprecation warning on the `artistName` field.

We also have a working graph relationship between songs and artists — awesome!

...But look at your `console`. Notice any duplicates?

This means we're fetching the same data multiple times from the iTunes API. This can overload your backend APIs and will cause your clients to spend additional time waiting for a response.

Apollo Server's built-in tracing plugin and external observability tools can help you keep an eye on resolver performance as you try to fix this.

## N+1 Queries

Each `artist` call might take about `170ms` depending on your Internet speed. For these 10 results, we're making 7 unnecessary calls. These will likely fire off concurrently since they're in the same execution level, but it's possible they could add an additional `1.2s` or more to the response time if we overload the API we're calling. Yikes!

Imagine how much worse this becomes when we change the `songs` search limit to `100`, `1000`, etc.

What if we query for all songs on The Beatles' album `Abbey Road`? The `artist` resolver for `Song` will be calling the iTunes API **17** times for the exact same artist ID.

This could definitely cause performance issues for both our clients and our backend services, databases, etc. How can we fix this?

## DataLoader (Batching & Caching)

[DataLoader](https://github.com/graphql/dataloader#using-with-graphql) will coalesce all individual `load`s which occur within a single frame of execution (a single tick of the event loop) and then call your batch function with all requested keys. The result is cached on the request, so additional calls to `load` for the same key on the same request will return the cached value.

Let's kill our server to install `dataloader` and start it back up

```bash
$ bun add dataloader
$ bun start
```

In `src/context.ts`, we'll want to import dataloader at the top

```ts
import DataLoader from 'dataloader';
```

We'll also want to change our context to include a `loaders` field so they can be used in all resolvers.

Our context already gets generated for each request in `src/index.ts`, which means our cache won't be [held across requests](https://github.com/graphql/dataloader#creating-a-new-dataloader-per-request). This is generally a good idea whether you're using DataLoaders or not. You might want to have a cache in your connectors themselves, but those caches generally shouldn't be shared across requests or between different users.

```ts
export const createContext = (): GraphQLContext => {
  const connectors = createConnectors();
  const loaders = {};

  return { connectors, loaders };
};
```

and we'll create our first loader for `artist`

```ts
export const createContext = (): GraphQLContext => {
  const connectors = createConnectors();

  const loaders = {
    artist: new DataLoader<string, Artist | null>((ids) => (
      connectors.iTunes.artistsByIds(ids)
    )),
  };

  return { connectors, loaders };
};
```

Now let's modify our `artist` field resolver under the `Song` object to use the loader

```ts
artist: t.field({
  type: ArtistRef,
  nullable: true,
  resolve: ({ artistId }, _args, ctx) => (
    artistId ? ctx.loaders.artist.load(artistId) : null
  ),
}),
```

Open [Sandbox](http://localhost:4000) again and send the same query for `songs` with artist details

```graphql
{
  songs(name: "Sun") {
    id
    name
    album
    url
    artist {
      id
      name
      url
      genre
    }
  }
}
```

Each artist ID should only be looked up once! 🎉

We can also solve this problem using a memoization cache instead of a DataLoader. Apollo built `RESTDataSource` to use a memoization cache on `GET` requests in order to solve this problem and I think it's more straightforward than using a DataLoader. We would just need to rewrite our connectors to extend `RESTDataSource`. I'll leave that exercise up to you!

Even with a RESTDataSource, a DataLoader is still useful for batching requests to APIs that support a batch endpoint (something like `getArtistsByIDs`).

## 🚀 Conclusion

You've reached the end of this introductory GraphQL workshop.

How do you feel? Heck, I'm proud of you!

Today you learned about:

* GraphQL servers (Apollo)
* GraphQL tools (Sandbox, schema exploration, type checking, and tests)
* Organizing GraphQL projects
* Queries
* Schema / Types
* Resolvers
* Pothos defining schema and resolvers in one place
* Context
* Connectors (and making HTTP requests)
* Execution levels (and passing data down)
* Field Arguments
* Query Variables
* Nullability
* Throwing Errors
* Deprecating Fields
* Graph Relationships
* Naive Pitfalls (N+1 Queries)
* ... and how to solve those with DataLoaders or RESTDataSource

You can see the entire completed API project in the [complete branch](https://github.com/nathanchapman/graphql-music/tree/complete).

If you liked this workshop, please give it a ⭐️ and [follow me](https://github.com/nathanchapman) for more content like this!
