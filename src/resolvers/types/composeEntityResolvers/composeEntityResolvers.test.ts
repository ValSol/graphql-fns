/* eslint-env jest */

import type { GeneralConfig, ServersideConfig, TangibleEntityConfig } from '../../../tsTypes';

import composeEntityResolvers from './index';

describe('composeEntityResolvers', () => {
  test('should create resolver for type', () => {
    const placeConfig: TangibleEntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [
        {
          name: 'title',
          required: true,
        },
      ],
    };
    const personConfig = {} as TangibleEntityConfig;

    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
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
      allEntityConfigs: { Place: placeConfig, Person: personConfig },
    };

    const serversideConfig: Record<string, any> = {};

    const result = composeEntityResolvers(personConfig, generalConfig, serversideConfig);

    expect(typeof result.friends).toBe('function');
    expect(typeof result.enemies).toBe('function');
    expect(typeof result.location).toBe('function');
    expect(typeof result.favoritePlace).toBe('function');
  });

  test('should create resolver for type', () => {
    const personConfig = {} as TangibleEntityConfig;
    const placeConfig: TangibleEntityConfig = {
      name: 'Place',
      type: 'tangible',
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
      type: 'tangible',
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

    const serversideConfig: ServersideConfig = {};

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Place: placeConfig, Person: personConfig },
    };

    const result = composeEntityResolvers(personConfig, generalConfig, serversideConfig);

    expect(typeof result.friends).toBe('function');
    expect(typeof result.enemies).toBe('function');
    expect(typeof result.location).toBe('function');
    expect(typeof result.favoritePlace).toBe('function');
  });
  test('should create resolver for type', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Place',
      type: 'tangible',
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
      allEntityConfigs: { Place: entityConfig },
    };

    const serversideConfig: Record<string, any> = {};

    const result = composeEntityResolvers(entityConfig, generalConfig, serversideConfig);

    expect(typeof result.position).toBe('function');
    expect(typeof result.positions).toBe('function');
    expect(typeof result.area).toBe('function');
    expect(typeof result.areas).toBe('function');
  });
});
