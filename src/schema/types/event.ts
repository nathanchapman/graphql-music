import { EventRef, TicketRef, VenueRef, WeatherRef } from './refs.ts';

TicketRef.implement({
  fields: (t) => ({
    status: t.exposeString('status', { nullable: true }),
    url: t.exposeString('url', { nullable: true }),
  }),
});

VenueRef.implement({
  fields: (t) => ({
    name: t.exposeString('name', { nullable: true }),
    latitude: t.exposeString('latitude', { nullable: true }),
    longitude: t.exposeString('longitude', { nullable: true }),
    city: t.exposeString('city', { nullable: true }),
    region: t.exposeString('region', { nullable: true }),
    country: t.exposeString('country', { nullable: true }),
  }),
});

EventRef.implement({
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
    weather: t.field({
      type: WeatherRef,
      nullable: true,
      resolve: ({ datetime, venue }, _args, ctx) => (
        venue ? ctx.connectors.weather.forecast({ datetime, venue }) : null
      ),
    }),
  }),
});
