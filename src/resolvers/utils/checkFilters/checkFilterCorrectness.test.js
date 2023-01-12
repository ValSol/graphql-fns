// @flow
/* eslint-env jest */
import type { DerivativeAttributes, EntityConfig, GeneralConfig } from '../../../flowTypes';

import checkFilterCorrectness from './checkFilterCorrectness';

describe('checkFilterCorrectness', () => {
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
      // Place: ['entity', 'entities'],
    },
  };

  const derivative = { ForView };

  const generalConfig: GeneralConfig = {
    allEntityConfigs: { Person: personConfig, Place: placeConfig },
    derivative,
  };

  test('should check the simplest correct filter', () => {
    const filter = {};
    const entityName = 'Place';
    const result = checkFilterCorrectness(entityName, filter, generalConfig);

    const expectedResult = true;
    expect(result).toBe(expectedResult);
  });

  test('should check the filter with incorrect "EntityName"', () => {
    const filter = { address_: { abc: 8 } };
    const entityName = 'Place';
    const t = () => checkFilterCorrectness(entityName, filter, generalConfig);

    expect(t).toThrow(
      'Field "address" not found in "Place" entity in filter: ""Place": "{"address_":{"abc":8}}"!',
    );
  });

  test('should check the incorrect filter', () => {
    const filter = { visitors_: { abc: 5 } };
    const entityName = 'Place';
    const t = () => checkFilterCorrectness(entityName, filter, generalConfig);

    expect(t).toThrow(
      'Field "abc" not found in "Person" entity in filter: ""Place": "{"visitors_":{"abc":5}}"!',
    );
  });
});
