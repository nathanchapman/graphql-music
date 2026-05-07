import { builder } from '../builder.ts';
import { TemperatureRef, WeatherRef } from './refs.ts';

const TemperatureUnitRef = builder.enumType('TemperatureUnit', {
  values: ['C', 'F'] as const,
});

TemperatureRef.implement({
  fields: (t) => ({
    high: t.exposeInt('high'),
    low: t.exposeInt('low'),
    unit: t.expose('unit', { type: TemperatureUnitRef }),
  }),
});

WeatherRef.implement({
  fields: (t) => ({
    condition: t.exposeString('condition', { nullable: true }),
    temperature: t.field({
      type: TemperatureRef,
      nullable: true,
      args: {
        unit: t.arg({ type: TemperatureUnitRef, defaultValue: 'F' }),
      },
      resolve: ({ high, low }, { unit }) => {
        if (high === null || low === null) return null;

        const resolvedUnit = unit ?? 'F';
        const fahrenheit = (celsius: number) => celsius * 9 / 5 + 32;
        const h = resolvedUnit === 'C' ? high : fahrenheit(high);
        const l = resolvedUnit === 'C' ? low : fahrenheit(low);

        return {
          unit: resolvedUnit,
          high: Math.round(h),
          low: Math.round(l),
        };
      },
    }),
  }),
});
