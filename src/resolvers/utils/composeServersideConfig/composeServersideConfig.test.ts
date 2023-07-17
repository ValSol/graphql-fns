/* eslint-env jest */
import type {
  DescendantAttributes,
  TangibleEntityConfig,
  GeneralConfig,
  ServersideConfig,
  SimplifiedEntityFilters,
} from '../../../tsTypes';

import composeServersideConfig from './index';

describe('composeFilters', () => {
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
    duplexFields: [
      {
        name: 'visitors',
        oppositeName: 'favoritePlace',
        array: true,
        config: personConfig,
        type: 'duplexFields',
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
        name: 'favoritePlace',
        oppositeName: 'visitors',
        config: placeConfig,
        type: 'duplexFields',
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
    ],
  });

  const ForView: DescendantAttributes = {
    descendantKey: 'ForView',
    allow: {
      Person: ['entity', 'entities'],
    },
  };

  const descendant = { ForView };

  const generalConfig: GeneralConfig = {
    allEntityConfigs: { Person: personConfig, Place: placeConfig },
    descendant,
  };

  test('should check the simplest correct filter', () => {
    const serversideConfig = {};

    const result = composeServersideConfig(generalConfig, serversideConfig);

    const expectedResult = serversideConfig;
    expect(result).toEqual(expectedResult);
  });

  test('should check the simplest correct filter', () => {
    const staticFilters = { Place: { title_gt: 'Ivan' } };
    const serversideConfig = { staticFilters };

    const result = composeServersideConfig(generalConfig, serversideConfig);

    const expectedResult = serversideConfig;
    expect(result).toEqual(expectedResult);
  });

  test('should check filters when inventory with exclude "Subscription"', () => {
    const staticFilters = { Place: { title_gt: 'Ivan' } };
    const serversideConfig = { staticFilters };

    const result = composeServersideConfig(generalConfig, serversideConfig);

    const expectedResult = serversideConfig;
    expect(result).toEqual(expectedResult);
  });
});
