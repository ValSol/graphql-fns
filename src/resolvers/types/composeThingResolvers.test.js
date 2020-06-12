// @flow
/* eslint-env jest */

import type { GeneralConfig, ThingConfig } from '../../flowTypes';

import composeThingResolvers from './composeThingResolvers';

describe('composeThingResolvers', () => {
  test('should create resolver for type', () => {
    const placeConfig: ThingConfig = {
      name: 'Place',
      textFields: [
        {
          name: 'title',
          required: true,
        },
      ],
    };
    const personConfig: ThingConfig = {};

    Object.assign(personConfig, {
      name: 'Person',
      textFields: [
        {
          name: 'firstName',
          required: true,
        },
        {
          name: 'lastName',
          required: true,
        },
      ],
      relationalFields: [
        {
          name: 'friends',
          config: personConfig,
          array: true,
          required: true,
        },
        {
          name: 'enemies',
          config: personConfig,
          array: true,
        },
        {
          name: 'location',
          config: placeConfig,
          required: true,
        },
        {
          name: 'favoritePlace',
          config: personConfig,
        },
      ],
    });
    const generalConfig: GeneralConfig = {
      thingConfigs: { Place: placeConfig, Person: personConfig },
    };

    const serversideConfig = {};

    const result = composeThingResolvers(personConfig, generalConfig, serversideConfig);

    expect(typeof result.friends).toBe('function');
    expect(typeof result.enemies).toBe('function');
    expect(typeof result.location).toBe('function');
    expect(typeof result.favoritePlace).toBe('function');
  });

  test('should create resolver for type', () => {
    const personConfig: ThingConfig = {};
    const placeConfig = {
      name: 'Place',
      textFields: [{ name: 'name' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          config: personConfig,
        },
        {
          name: 'visitors',
          oppositeName: 'favoritePlace',
          array: true,
          config: personConfig,
        },
      ],
    };
    Object.assign(personConfig, {
      name: 'Person',
      textFields: [
        {
          name: 'firstName',
          required: true,
        },
        {
          name: 'lastName',
          required: true,
        },
      ],
      duplexFields: [
        {
          name: 'friends',
          oppositeName: 'friends',
          config: personConfig,
          array: true,
          required: true,
        },
        {
          name: 'enemies',
          oppositeName: 'enemies',
          array: true,
          config: personConfig,
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
        },
        {
          name: 'favoritePlace',
          oppositeName: 'visitors',
          config: placeConfig,
        },
      ],
    });

    const serversideConfig = {};

    const generalConfig: GeneralConfig = {
      thingConfigs: { Place: placeConfig, Person: personConfig },
    };

    const result = composeThingResolvers(personConfig, generalConfig, serversideConfig);

    expect(typeof result.friends).toBe('function');
    expect(typeof result.enemies).toBe('function');
    expect(typeof result.location).toBe('function');
    expect(typeof result.favoritePlace).toBe('function');
  });
  test('should create resolver for type', () => {
    const thingConfig: ThingConfig = {
      name: 'Place',
      geospatialFields: [
        {
          name: 'position',
          geospatialType: 'Point',
        },
        {
          name: 'positions',
          geospatialType: 'Point',
          array: true,
        },
        {
          name: 'area',
          geospatialType: 'Polygon',
        },
        {
          name: 'areas',
          geospatialType: 'Polygon',
          array: true,
        },
      ],
    };

    const generalConfig: GeneralConfig = {
      thingConfigs: { Place: thingConfig },
    };

    const serversideConfig = {};

    const result = composeThingResolvers(thingConfig, generalConfig, serversideConfig);

    expect(typeof result.position).toBe('function');
    expect(typeof result.positions).toBe('function');
    expect(typeof result.area).toBe('function');
    expect(typeof result.areas).toBe('function');
  });
});
