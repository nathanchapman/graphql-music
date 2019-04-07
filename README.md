# 🎸 graphql-music

For this introductory GraphQL workshop, we'll be building an API with music data to support clients that display information about artists, songs, lyrics, tabs (sheet music), and concerts 🎵

This workshop assumes you already have a basic knowledge of [what GraphQL is](https://www.howtographql.com/basics/0-introduction/) and [how to write code in Node.js](https://codeburst.io/the-only-nodejs-introduction-youll-ever-need-d969a47ef219).

This workshop typically takes about 2 to 2.5 hours to complete. I've broken it down into sections to make it easier to take breaks and jump back in whenever you're ready. To start at the beginning of any given section, just `git checkout` the branch with that name (i.e. `part1`, `part2`, etc.)

## Contents

### Setup

> Starting branch: [master](https://github.com/nathanchapman/graphql-music/tree/master)

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

Install the dev dependencies

```bash
$ npm install
```

Install [apollo-server](https://github.com/apollographql/apollo-server), [graphql-js](https://github.com/graphql/graphql-js), and [graphql-import](https://github.com/prisma/graphql-import) 🚀

```bash
$ npm install apollo-server graphql graphql-import
```

Take a look at the boilerplate code in `src/index.js`

```js
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
```

At this point, you should be able to run `npm start` to start the server. Your server will automatically restart each time we make changes. Navigate to <http://localhost:4000> to see the demo server's Playground. [GraphQL Playground](https://www.apollographql.com/docs/apollo-server/features/graphql-playground.html) is a graphical, interactive, in-browser GraphQL IDE where you can explore the schema, craft queries, and view performance information like tracing.

At any point during this workshop, you can view the current schema by clicking the `SCHEMA` or `DOCS` buttons on the right side of the Playground. The development server will restart when you make changes to files in the project and Playground will automatically pick those up, so there's no need to refresh the page.

We can test our demo server by sending our first query in the Playground.

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

## Organize

Let's organize things a little better!

Go ahead and delete the example code for `typeDefs` and `resolvers` from `src/index.js`.

Create a folder `src/resolvers` and add an `index.js` to it.

Create another folder `src/schema` and add a file named `schema.graphql` to it.

Now we need to import these into our `src/index.js`.

Your `src/index.js` should look like this:

```js
const { ApolloServer } = require('apollo-server');
const { importSchema } = require('graphql-import');
const resolvers = require('./resolvers');

const typeDefs = importSchema('src/schema/schema.graphql');

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```

At this point, your changes should be in line with the starting branch for [part1](https://github.com/nathanchapman/graphql-music/tree/part1).

## Creating your first Query

We know our clients will need information about `artist`s. Let's define what an artist is by adding the `Artist` type in a new file `src/schema/artist.graphql`.

```graphql
type Artist {
  id: ID!
  name: String!
  url: String
  genre: String
}
```

***Note:*** These fields should be determined by **both** the needs of the clients and capabilities of our backend APIs.

Now let's add our first Query to `src/schema/schema.graphql`

```graphql
# import Artist from 'artist.graphql'

type Query {
  artists(name: String!): [Artist]!
}
```

This query will allow our clients to search for artists and get an array of results!

Notice the `import` statement in our `schema.graphql` and how we're using `importSchema` in our `src/index.js` file? Both of those come from the [graphql-import](https://github.com/prisma/graphql-import) module we installed earlier.

There are [several ways to represent a GraphQL schema](https://blog.apollographql.com/three-ways-to-represent-your-graphql-schema-a41f4175100d), including: using the [GraphQL.js](https://github.com/graphql/graphql-js#using-graphqljs) `GraphQLSchema` and `GraphQLObjectType` classes or [GraphQL Schema Definition Language](https://www.prisma.io/blog/graphql-sdl-schema-definition-language-6755bcb9ce51) (SDL). We'll be using GraphQL SDL in this workshop because it's the most popular and arguably easier to read and understand.

Further, you can represent GraphQL SDL in a number of ways, including: [strings](https://www.apollographql.com/docs/graphql-tools/generate-schema#example), [graphql-tag](https://github.com/apollographql/graphql-tag#gql) (gql), and directly in `.graphql` or `.gql` files. Any of these approaches work just fine, but we'll be using `.graphql` files to keep things simple and reduce the amount of boilerplate code.

[graphql-import](https://github.com/prisma/graphql-import) gives us the ability to import our schema into JavaScript files using `importSchema` as well as break up our schema into different files by letting us import `.graphql` files into other `.graphql` files. Pretty cool!

Now we have our type definitions for what an `Artist` is and how to `Query` for one. Awesome! But how do we actually fetch and return data?

## Creating your first Resolver

`Resolvers` are functions that are executed by our server to resolve the data for our schema. The object we create containing these functions will have the same shape as our schema. We can define a resolver for any field on any type, but often times we're able to rely on the [default resolver](https://www.apollographql.com/docs/graphql-tools/resolvers/#default-resolver) for trivial resolutions like returning a named property on an object.

Add a `Query.artists` resolver to `src/resolvers/index.js`

```js
const resolvers = {
  Query: {
    artists: (_, { name }) => [{ name }],
  },
};

module.exports = resolvers;
```

Open the Playground at <http://localhost:4000> and send a query for `artists`

```graphql
{
  artists(name: "Fake") {
    name
  }
}
```

You'll receive fake data because we're just mocking an array with one object as the return value of the resolver, but now we have something executing!

*Notice* that if you ask for any non-nullable fields (denoted with a `!` in the schema) like `id`, you'll get an error `Cannot return null for non-nullable field Artist.id`. This is because we aren't returning a value for `id` from our resolver, only the `name`. Asking for normal, nullable fields like `url` and `genre` won't cause an error because they aren't guaranteed by our GraphQL server based on the type definition of `Artist` in the schema. For those nullable fields, you'll just receive `null` when no value is returned from the resolver.

## Let's get some Context

Resolvers take in 4 parameters: `root`, `args`, `context`, and `info`, respectively.

* `root` the value of the previous execution level (more on `execution levels` later)
* `args` any arguments passed directly into the given field
* `context` an object containing any data that should be made available to all resolvers (think logging functions, session information, data sources used to fetch information, etc.)
* `info` an object containing information about the query such as the selection set, the AST of the query, parent information, etc. This parameter isn't used as often, and I'd consider it as intended for more advanced cases.

## Creating your first Connector

Most GraphQL services follow some sort of `connector` pattern for data access. The idea here is to have a layer on top of a database/backend driver that has GraphQL-specific error handling, logging, batching, and caching. We'll touch more on these topics later. For now, let's just think of it as our sources for fetching data.

You guessed it! The connector will go on the `context` object passed into all resolvers.

Let's create a new folder `src/connectors` with an `index.js`

```js
const createConnectors = () => ({});

module.exports = createConnectors;
```

In our `src/index.js`, let's import that file and update our server to include a new `context` object

```js
...
const createConnectors = require('./connectors');

const typeDefs = importSchema('src/schema/schema.graphql');
const context = { connectors: createConnectors() };

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
});
...
```

Let's add a new file, `connectors/iTunes.js`

```js
class iTunes {}

module.exports = iTunes;
```

and import it into `connectors/index.js`

```js
const iTunes = require('./iTunes');

const createConnectors = () => ({
  iTunes: new iTunes(),
});

module.exports = createConnectors;
```

We'll need to make an [HTTP request](https://www.codecademy.com/articles/http-requests) to the iTunes API in our `iTunes` connector so we'll be using [got](https://github.com/sindresorhus/got), a simplified HTTP request library with support for [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

Let's kill our server with `ctrl+c`, install [got](https://github.com/sindresorhus/got), and start the server back up.

```bash
$ npm install got
$ npm start
```

Now we can make asynchronous HTTP requests!

At the top of `connectors/iTunes.js`, let's `require` the new dependency

```js
const { get } = require('got');
```

And let's add our first method inside the `iTunes` class

```js
async artists({ name }) {
  const options = {
    query: {
      term: name,
      country: 'us',
      entity: 'allArtist',
    },
    json: true,
  };

  const { body } = await get('https://itunes.apple.com/search', options);
  const { results } = body;
  return results.map(artist => ({
    name: artist.artistName,
    url: artist.artistLinkUrl,
    id: artist.artistId,
    genre: artist.primaryGenreName,
  }));
}
```

*Notice* that once we get the results, we're remapping the iTunes API results into objects that match our GraphQL type for `Artist`.

Now we can go back to `resolvers/index.js` and consume this connector from our `context`

```js
Query: {
  artists: (_, args, ctx) => ctx.connectors.iTunes.artists(args),
},
```

And that's it!

You can open the [Playground](http://localhost:4000) again and send a query for `artists`:

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

Create a `Song` type in a new file `src/schema/song.graphql`.

```graphql
type Song {
  id: ID!
  name: String!
  artistName: String
  album: String
  url: String
}
```

and add a new `Query` for `songs` in `src/schema/schema.graphql`

```graphql
# import Artist from 'artist.graphql'
# import Song from 'song.graphql'

type Query {
  artists(name: String!): [Artist]!
  songs(name: String!): [Song]!
}
```

Let's add another method to the `iTunes` connector

```js
async songs({ name }) {
  const options = {
    query: {
      term: name,
      country: 'us',
      entity: 'song',
    },
    json: true,
  };

  const { body } = await get('https://itunes.apple.com/search', options);
  const { results } = body;
  return results.map(song => ({
    name: song.trackName,
    artistName: song.artistName,
    album: song.collectionName,
    url: song.trackViewUrl,
    id: song.trackId,
  }));
}
```

*Notice* we're remapping the results again since the iTunes API definition of a song isn't exactly the same as the `Song` type definition we're using in our GraphQL API.

Now we just have to add a resolver for the `songs` query

```js
Query: {
  artists: (_, args, ctx) => ctx.connectors.iTunes.artists(args),
  songs: (_, args, ctx) => ctx.connectors.iTunes.songs(args),
},
```

Open the [Playground](http://localhost:4000) again and send a query for `songs`

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

In your `schema`, add limit query parameters with some reasonable defaults

```graphql
type Query {
  artists(name: String!, limit: Int = 5): [Artist]!
  songs(name: String!, limit: Int = 10): [Song]!
}
```

In your `iTunes` connector, add `limit` in **both** the `artists` and `songs` method signatures and to their `options.qs` objects

```js
async artists({ name, limit }) {
  const options = {
    query: {
      term: name,
      country: 'us',
      entity: 'allArtist',
      limit,
    },
    json: true,
  };
  ...
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

In your `schema`, add a `songs` field under the `Artist` type

```graphql
type Artist {
  id: ID!
  name: String!
  url: String
  genre: String
  songs(limit: Int = 10): [Song]!
}
```

and in your `resolvers` add a new type resolver object for `Artist` with a resolver for `songs`

```js
Query: {
  ...
},
Artist: {
  songs: ({ name }, { limit }, ctx) => (
    ctx.connectors.iTunes.songs({ name, limit })
  ),
},
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

Go ahead and add these fields to the `Song` type in your `schema`

```graphql
type Song {
  id: ID!
  name: String!
  artistName: String
  album: String
  url: String
  lyrics: String
  tabs: String
}
```

Add a new file `src/connectors/Lyrics.js`

```js
const { get } = require('got');

class Lyrics {
  async bySong({ name, artistName }) {
    const options = {
      json: true,
    };

    const url = `https://api.lyrics.ovh/v1/${artistName}/${name}`;
    try {
      const { body } = await get(url, options);
      return body.lyrics;
    } catch (error) {
      return null;
    }
  }
}

module.exports = Lyrics;
```

Let's import it in `connectors/index.js`

```js
...
const Lyrics = require('./Lyrics');

const createConnectors = () => ({
  ...
  Lyrics: new Lyrics(),
});

module.exports = createConnectors;
```

and in your `resolvers`, add a new root type resolver object for `Song` with a field resolver for `lyrics`

```js
Query: {
  ...
},
Artist: {
  ...
},
Song: {
  lyrics: (song, _, ctx) => ctx.connectors.Lyrics.bySong(song),
},
```

We have lyrics! 🎤

What about tabs?

[Songterr](https://www.songsterr.com/) provides tabs and an API, but they also have direct URLs we can use for loading sheet music by artist name and song name. That's all our clients needed! In this case, we don't even need a connector or an API call.

Just add a field resolver for `tabs` under the `Song` object

```js
...
Song: {
  lyrics: (song, _, ctx) => ctx.connectors.Lyrics.bySong(song),
  tabs: ({ name, artistName }) => (
    `http://www.songsterr.com/a/wa/bestMatchForQueryString?s=${name}&a=${artistName}`
  ),
},
```

Open the [Playground](http://localhost:4000) again and send a query for `songs` with lyrics and tabs

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

Let's add some `Event`-related types to our `schema` (think concerts, festivals, etc.)

> src/schema/event.graphql

```graphql
# import Ticket from 'ticket.graphql'
# import Venue from 'venue.graphql'

type Event {
  date: String!
  time: String!
  venue: Venue
  tickets: Ticket
  lineup: [String]
}
```

> src/schema/ticket.graphql

```graphql
type Ticket {
  status: String
  url: String
}
```

> src/schema/venue.graphql

```graphql
type Venue {
  name: String
  latitude: String
  longitude: String
  city: String
  region: String
  country: String
}
```

and add an `events` field under the `Artist` type

```graphql
# import Event from 'event.graphql'

type Artist {
  id: ID!
  name: String!
  url: String
  genre: String
  songs(limit: Int = 10): [Song]!
  events(limit: Int = 10): [Event]
}
```

We'll need a connector for event data. For this we'll be using the [BandsInTown API](https://app.swaggerhub.com/apis/Bandsintown/PublicAPI/3.0.0#/).

Add a new file `connectors/BandsInTown.js`

```js
const { get } = require('got');

class BandsInTown {
  async events({ name, limit }) {
    const options = {
      json: true,
    };

    const url = `https://rest.bandsintown.com/artists/${name}/events?app_id=qfasdfasdf`;
    const { body } = await get(url, options);
    return body.slice(0, limit);
  }
}

module.exports = BandsInTown;
```

and import it in `connectors/index.js`

```js
...
const BandsInTown = require('./BandsInTown');

const createConnectors = () => ({
  ...
  BandsInTown: new BandsInTown(),
});

module.exports = createConnectors;
```

Add the `events` field resolver under the `Artist` root object

```js
...
Artist: {
  ...
  events: ({ name }, { limit }, ctx) => (
    ctx.connectors.BandsInTown.events({ name, limit })
  ),
},
...
```

Open the [Playground](http://localhost:4000) again and send a query for `artists` with events

```graphql
{
  artists(name: "Blink-182", limit: 1) {
    name
    events {
      date
      time
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

Uh oh! We got a `Cannot return null for non-nullable field Event.date` error from our GraphQL server.

It looks like both `date` and `time` are `null` even though we're guaranteeing them as non-nullable in our schema (denoted with a `!`)

What caused the `null` values?

The BandsInTown API returned an object with a field named `datetime` instead of two different fields for `date` and `time`. Let's resolve the time and date from `datetime` using field resolvers on the `Event` type so our clients have the data they need.

```js
...
Event: {
  time: event => new Date(event.datetime).toLocaleTimeString(),
  date: event => new Date(event.datetime).toLocaleDateString(),
},
```

That's fixed, but `tickets` is `null`!

The response from `BandsInTown` has an `offers` array instead.

```js
Event: {
  ...
  tickets: event => event.offers.find(offer => offer.type === 'Tickets'),
},
```

No more errors or `null` — awesome!

## Weather

Now let's add some `Weather` types to our `schema` so we can fetch the weather conditions on the day of an `Event`

> src/schema/weather.graphql

```graphql
type Weather {
  condition: String
  temperature(unit: TemperatureUnit = F): Temperature
}

type Temperature {
  high: Int
  low: Int
  unit: TemperatureUnit
}

enum TemperatureUnit {
  C
  F
}
```

Under the `Event` type, add a `weather` field

```graphql
# import Ticket from 'ticket.graphql'
# import Venue from 'venue.graphql'
# import * from 'weather.graphql'

type Event {
  date: String!
  time: String!
  venue: Venue
  tickets: Ticket
  lineup: [String]
  weather: Weather
}
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

We'll use [MetaWeather](https://www.metaweather.com/api/) instead. It's a bit easier to work with anyways.

Add a new connector `connectors/Weather.js`

```js
const { get } = require('got');

const format = weather => ({
  condition: weather.weather_state_name,
  high: weather.max_temp,
  low: weather.min_temp,
});

class Weather {
  async forecast({ datetime, venue }) {
    const date = new Date(datetime);
    const [year, month, day] = [
      date.getFullYear(), date.getMonth() + 1, date.getDate(),
    ];

    const { latitude, longitude } = venue;

    const location = {
      query: {
        lattlong: `${latitude},${longitude}`,
      },
      json: true,
    };

    const {
      body: [{ woeid }], // use the first city woeid returned from the search
    } = await get('https://www.metaweather.com/api/location/search/', location);

    const options = { json: true };
    const weather = y => m => d => `https://www.metaweather.com/api/location/${woeid}/${y}/${m}/${d}/`;

    // Forecasts only work 5-10 days in the future
    const { body: [forecasted] } = await get(
      weather(year)(month)(day),
      options,
    );

    if (forecasted) return format(forecasted);

    // Fallback to last year's weather report
    const { body: [historical] } = await get(
      weather(year-1)(month)(day),
      options,
    );

    if (historical) return format(historical);

    throw new Error('Unable to retrieve weather data for event');
  }
}

module.exports = Weather;
```

Initialize your `Weather` connector in `connectors/index.js` like you've done with the other connectors

```js
...
const Weather = require('./Weather');

const createConnectors = () => ({
  ...
  Weather: new Weather(),
});

module.exports = createConnectors;
```

Add a field resolver for `weather` under the `Event` object

```js
Event: {
  ...
  weather: ({ datetime, venue }, _, ctx) => (
    ctx.connectors.Weather.forecast({ datetime, venue })
  ),
},
```

*Notice* we're using the `datetime` from the root object (`Event` returned by BandsInTown) even though we didn't publicly expose that field in our GraphQL API. GraphQL gives us the entire object returned from the previous execution level as `root` (the first argument). This is a great way to pass data from a root object to the next execution level without exposing the implementation details of your API!

Open the [Playground](http://localhost:4000) again and send a query for `artists` with `events` and `weather`

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
      date
      time
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

`temperature` is `null` 😧

We're returning the temperatures in our Weather connector as `Weather.high` and `Weather.low` (both in Celsius from the MetaWeather API). This doesn't quite line up with our schema! They should be under the `Weather.temperature` object and return the correct values for both Celsius and Farenheit. Let's fix it by adding a resolver for `Weather.temperature` that uses the `high` and `low` fields from the `Weather` object and handles conversion.

```js
...
Weather: {
  temperature: ({ high, low }, { unit }) => {
    const fahrenheit = c => c * 9 / 5 + 32
    const h = unit === 'C' ? high : fahrenheit(high);
    const l = unit === 'C' ? low : fahrenheit(low);

    return {
      unit,
      high: Math.round(h),
      low: Math.round(l),
    };
  },
},
```

Try the query again and make sure to prepare for the weather! ☔️⛅️😎

Our clients can still get `null` for `weather`, but that's only if the MetaWeather API fails to return both the forecast and historical data. This is a lot less likely, but if it does fail, the clients will also get an error telling them about the issue.

```json
{
  "data": {
    "artists": [
      {
        "name": "Blink-182",
        "events": [
          {
            "weather": null,
            "date": "2019-6-12"
          }
        ]
      }
    ]
  },
  "errors": [
    {
      "message": "Unable to retrieve weather data for event",
      "locations": [
        {
          "line": 5,
          "column": 7
        }
      ],
      "path": ["artists", 0, "events", 0, "weather"],
      "extensions": {
        "code": "INTERNAL_SERVER_ERROR",
        "exception": {
          "stacktrace": [
            "Error: Unable to retrieve weather data for event"
          ]
        }
      }
    }
  ],
}
```

Errors are very useful! We can use errors to intelligently inform our clients about issues with provided inputs, API degredations, and many other types of issues. Remember to not expose sensitive information like unexpected errors, stacktraces, etc. in production! See [Apollo's Error handling guide](https://www.apollographql.com/docs/apollo-server/features/errors/) for more information.

At this point, your changes should be in line with the starting branch for [part4](https://github.com/nathanchapman/graphql-music/tree/part4).

## More Graph Relationships

Our clients want to be able to search for songs and get more artist information back than just `artistName`.

Remember earlier when we set up a graph relationship between artists and their songs?

We should create a similar relationship between a `Song` and its `Artist`.

In your `schema`, add a field for `artist` under the `Song` type

```graphql
type Song {
  ...
  artist: Artist
}
```

We'll need to modify our `songs` method in our `iTunes` connector to return the artist's ID

```js
return {
  ...
  artistId: song.artistId,
};
```

Let's add another method to our `iTunes` connector to lookup an artist by ID

```js
async artist({ id }) {
  const options = {
    query: { id },
    json: true,
  };

  console.log(`looking up artist ${id}`);

  const { body } = await get('https://itunes.apple.com/lookup', options);
  const artist = body.results[0];

  return {
    name: artist.artistName,
    url: artist.artistLinkUrl,
    id: artist.artistId,
    genre: artist.primaryGenreName,
  };
}
```

and add a field `resolver` for `artist` under the `Song` root object

```js
Song: {
  ...
  artist: ({ artistId }, _, ctx) => (
    ctx.connectors.iTunes.artist({ id: artistId })
  ),
},
```

Lastly, let's deprecate the old `artistName` field in our `schema` so that new clients won't know about that field. It will still work as expected for older clients that may still be requesting it and you should keep it around until you can confirm it's not being called anymore (think mobile apps that haven't been updated yet!)

```graphql
type Song {
  ...
  artist: Artist
  artistName: String @deprecated(reason: "Use `artist.name`.")
  ...
}
```

Open the [Playground](http://localhost:4000) again and send a query for `songs` with artist details

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

Let's turn on `tracing` to keep an eye on the performance as we try to fix this.

In `src/index.js`, let's set `tracing: true` in the server configuration

```js
...
const server = new ApolloServer({
  tracing: true,
  typeDefs,
  resolvers,
  context,
});
```

Now back in `Playground`, click the `TRACING` tab in the bottom right corner and run your query again. Here we can see exactly how long it took for each resolver to run.

## N+1 Queries

Each `artist` call might take about `170ms` depending on your Internet speed. For these 10 results, we're making 7 unnecessary calls. These will likely fire off concurrently since they're in the same execution level, but it's possible they could add an additional `1.2s` or more to the response time if we overload the API we're calling. Yikes!

Imagine how much worse this becomes when we change the `songs` search limit to `100`, `1000`, etc.

What if we query for all songs on The Beatles' album `Abbey Road`? The `artist` resolver for `Song` will be calling the iTunes API **17** times for the exact same artist ID.

This could definitely cause performance issues for both our clients and our backend services, databases, etc. How can we fix this?

## DataLoader (Batching & Caching)

[DataLoader](https://github.com/facebook/dataloader#using-with-graphql) will coalesce all individual `load`s which occur within a single frame of execution (a single tick of the event loop) and then call your batch function with all requested keys. The result is cached on the request, so additional calls to `load` for the same key on the same request will return the cached value.

Let's kill our server to install `dataloader` and start it back up

```bash
$ npm install dataloader
$ npm start
```

In `src/index.js`, we'll want to `require` dataloader at the top

```js
const DataLoader = require('dataloader');
```

We'll also want to change our `context` to include a `loaders` field so they can be used in all `resolvers`.

Our `context` is just a static object, but we'll need a new context to be generated for each request so our cache isn't [held across requests](https://github.com/facebook/dataloader#creating-a-new-dataloader-per-request). This is generally a good idea whether you're using DataLoaders or not. You might want to have a cache in your connectors themselves, but those caches generally shouldn't be shared across requests or between different users. So let's make `context` a function!

```js
const context = () => {
  const connectors = createConnectors();
  const loaders = {};

  return { connectors, loaders };
};

const server = new ApolloServer({
  tracing: true,
  typeDefs,
  resolvers,
  context,
});
```

and we'll create our first loader for `artist`

```js
const context = () => {
  const connectors = createConnectors();
  const loaders = {
    artist: new DataLoader(IDs => Promise.resolve(
      IDs.map(id => connectors.iTunes.artist({ id })),
    )),
  };

  return { connectors, loaders };
};
```

Now let's modify our `artist` field resolver under the `Song` root object to use the loader

```js
Song: {
  ...
  artist: ({ artistId }, _, ctx) => (
    ctx.loaders.artist.load(artistId)
  ),
},
```

Open the [Playground](http://localhost:4000) again and send the same query for `songs` with artist details

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

We can also solve this problem using a memoization cache instead of a DataLoader. [Apollo](https://www.apollographql.com/) built the [RESTDataSource](https://www.apollographql.com/docs/apollo-server/features/data-sources) to use a memoization cache on `GET` requests in order to solve this problem and I think it's more straightforward than using a DataLoader. We would just need to rewrite our connectors to `extend RESTDataSource`. I'll leave that exercise up to you!

Even with a RESTDataSource, a DataLoader is still useful for [batching requests](https://www.apollographql.com/docs/apollo-server/features/data-sources/#batching) to APIs that support a batch endpoint (something like `getArtistsByIDs`).

## 🚀 Conclusion

You've reached the end of this introductory GraphQL workshop.

How do you feel? Heck, I'm proud of you!

Today you learned about:

* GraphQL servers (Apollo)
* GraphQL tools (Playground, tracing, graphql-import)
* Organizing GraphQL projects
* Queries
* Schema / Types
* Resolvers
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
