/* eslint-env jest */
import type { DerivativeAttributes, TangibleEntityConfig, GeneralConfig } from '../../../tsTypes';

import checkFilterCorrectness from './checkFilterCorrectness';

describe('checkFilterCorrectness', () => {
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
        config: personConfig,
        array: true,
        required: true,
        type: 'relationalFields',
      },
      {
        name: 'enemies',
        config: personConfig,
        array: true,
        type: 'relationalFields',
      },
      {
        name: 'location',
        config: placeConfig,
        required: true,
        type: 'relationalFields',
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
    const filter: Record<string, any> = {};
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
