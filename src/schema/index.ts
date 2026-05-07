import './queries/greet.ts';
import { builder } from './builder.ts';

export const schema = builder.toSchema();
