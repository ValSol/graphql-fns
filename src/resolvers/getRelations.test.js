// @flow
/* eslint-env jest */
import type { ThingConfig } from '../flowTypes';

const getRelations = require('./getRelations');

describe('getRelations', () => {
  test('should return map with relations', () => {
    const thingConfig: ThingConfig = {};
    const thingConfig2: ThingConfig = {
      name: 'Thing2',
      relationalFields: [
        { config: thingConfig, name: 'relationalField_2' },
        { array: true, config: thingConfig, name: 'relationalField_2a' },
      ],
    };
    const thingConfig3 = {
      name: 'Thing3',
      relationalFields: [
        { config: thingConfig, name: 'relationalField_3' },
        { array: true, config: thingConfig, name: 'relationalField_3a' },
      ],
    };
    Object.assign(thingConfig, {
      name: 'Thing',
      relationalFields: [
        {
          name: 'relationalField_1',
          config: thingConfig,
        },
        {
          name: 'relationalField_1a',
          config: thingConfig,
          array: true,
        },
      ],
    });

    const thingConfigs = [thingConfig, thingConfig2, thingConfig3];

    const expectedResult = new Map();
    expectedResult.set(thingConfig, [
      {
        name: 'relationalField_1',
      },
      {
        name: 'relationalField_1a',
        array: true,
      },
    ]);
    expectedResult.set(thingConfig2, [
      {
        name: 'relationalField_2',
      },
      {
        name: 'relationalField_2a',
        array: true,
      },
    ]);
    expectedResult.set(thingConfig3, [
      {
        name: 'relationalField_3',
      },
      {
        name: 'relationalField_3a',
        array: true,
      },
    ]);
    const result = getRelations(thingConfig, thingConfigs);
    expect(result).toEqual(expectedResult);
  });
});
