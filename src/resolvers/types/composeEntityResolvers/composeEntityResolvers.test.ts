/* eslint-env jest */

import type { GeneralConfig, ServersideConfig, TangibleEntityConfig } from '../../../tsTypes';

import composeEntityResolvers from './index';

describe('composeEntityResolvers', () => {
  test('should create resolver for type', () => {
    const personConfig = {} as TangibleEntityConfig;

    const placeConfig: TangibleEntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [
        {
          name: 'title',
          required: true,
          type: 'textFields',
        },
      ],
      relationalFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'customers',
          oppositeName: 'favoritePlace',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
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
          type: 'textFields',
        },
        {
          name: 'lastName',
          required: true,
          type: 'textFields',
        },
      ],
      relationalFields: [
        {
          name: 'friends',
          oppositeName: 'fellows',
          config: personConfig,
          array: true,
          required: true,
          type: 'relationalFields',
        },
        {
          name: 'fellows',
          oppositeName: 'friends',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'enemies',
          oppositeName: 'opponents',
          config: personConfig,
          array: true,
          type: 'relationalFields',
        },
        {
          name: 'opponents',
          oppositeName: 'enemies',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
          type: 'relationalFields',
        },
        {
          name: 'favoritePlace',
          oppositeName: 'customers',
          config: placeConfig,
          type: 'relationalFields',
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
      textFields: [{ name: 'name', type: 'textFields' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          config: personConfig,
          type: 'duplexFields',
        },
        {
          name: 'visitors',
          oppositeName: 'favoritePlace',
          array: true,
          config: personConfig,
          type: 'duplexFields',
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
          type: 'textFields',
        },
        {
          name: 'lastName',
          required: true,
          type: 'textFields',
        },
      ],
      duplexFields: [
        {
          name: 'friends',
          oppositeName: 'friends',
          config: personConfig,
          array: true,
          required: true,
          type: 'duplexFields',
        },
        {
          name: 'enemies',
          oppositeName: 'enemies',
          array: true,
          config: personConfig,
          type: 'duplexFields',
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
          type: 'duplexFields',
        },
        {
          name: 'favoritePlace',
          oppositeName: 'visitors',
          config: placeConfig,
          type: 'duplexFields',
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
          type: 'geospatialFields',
        },
        {
          name: 'positions',
          geospatialType: 'Point',
          array: true,
          type: 'geospatialFields',
        },
        {
          name: 'area',
          geospatialType: 'Polygon',
          type: 'geospatialFields',
        },
        {
          name: 'areas',
          geospatialType: 'Polygon',
          array: true,
          type: 'geospatialFields',
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
