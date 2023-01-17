// @flow
/* eslint-env jest */
import type { DerivativeAttributes, EntityConfig, GeneralConfig } from '../../../flowTypes';

import composeServersideConfig from './index';

describe('composeFilters', () => {
  const personConfig: EntityConfig = {};

  const placeConfig: EntityConfig = {
    name: 'Place',
    type: 'tangible',
    textFields: [
      {
        name: 'title',
        required: true,
      },
    ],
    duplexFields: [
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
        name: 'favoritePlace',
        oppositeName: 'visitors',
        config: placeConfig,
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
    ],
  });

  const ForView: DerivativeAttributes = {
    derivativeKey: 'ForView',
    allow: {
      Person: ['entity', 'entities'],
    },
  };

  const derivative = { ForView };

  const generalConfig: GeneralConfig = {
    allEntityConfigs: { Person: personConfig, Place: placeConfig },
    derivative,
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
