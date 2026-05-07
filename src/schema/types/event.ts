import { builder } from '../builder.ts';
import { WeatherRef } from './weather.ts';

export interface Ticket {
  status: string | null;
  type?: string | null;
  url: string | null;
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

export const TicketRef = builder.objectRef<Ticket>('Ticket').implement({
  fields: (t) => ({
    status: t.exposeString('status', { nullable: true }),
    url: t.exposeString('url', { nullable: true }),
  }),
});

export const VenueRef = builder.objectRef<Venue>('Venue').implement({
  fields: (t) => ({
    name: t.exposeString('name', { nullable: true }),
    latitude: t.exposeString('latitude', { nullable: true }),
    longitude: t.exposeString('longitude', { nullable: true }),
    city: t.exposeString('city', { nullable: true }),
    region: t.exposeString('region', { nullable: true }),
    country: t.exposeString('country', { nullable: true }),
  }),
});

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
    weather: t.field({
      type: WeatherRef,
      nullable: true,
      resolve: ({ datetime, venue }, _args, ctx) => (
        venue ? ctx.connectors.weather.forecast({ datetime, venue }) : null
      ),
    }),
  }),
});
