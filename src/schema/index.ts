import './types/artist.ts';
import './types/event.ts';
import './types/song.ts';
import './types/weather.ts';
import './queries/artists.ts';
import './queries/songs.ts';
import './queries/greet.ts';
import { builder } from './builder.ts';

export const schema = builder.toSchema();
