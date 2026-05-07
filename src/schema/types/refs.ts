import { builder } from '../builder.ts';

export interface Artist {
  id: string;
  name: string;
  url: string | null;
  genre: string | null;
}

export interface Song {
  id: string;
  name: string;
  artistName: string | null;
  album: string | null;
  url: string | null;
  artistId?: string | null;
}

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

export type TemperatureUnit = 'C' | 'F';

export interface Weather {
  condition: string | null;
  high: number | null;
  low: number | null;
}

export interface Temperature {
  high: number;
  low: number;
  unit: TemperatureUnit;
}

export const ArtistRef = builder.objectRef<Artist>('Artist');
export const SongRef = builder.objectRef<Song>('Song');
export const TicketRef = builder.objectRef<Ticket>('Ticket');
export const VenueRef = builder.objectRef<Venue>('Venue');
export const EventRef = builder.objectRef<Event>('Event');
export const WeatherRef = builder.objectRef<Weather>('Weather');
export const TemperatureRef = builder.objectRef<Temperature>('Temperature');
