// @flow
/* eslint-env jest */
import type { EntityConfig } from '../flowTypes';

import getRelations from './getRelations';

describe('getRelations', () => {
  test('should return map with relations', () => {
    const entityConfig: EntityConfig = {};
    const entityConfig2: EntityConfig = {
      name: 'entity2',
      type: 'tangible',
      relationalFields: [
        { config: entityConfig, name: 'relationalField_2' },
        { array: true, config: entityConfig, name: 'relationalField_2a' },
      ],
    };
    const entityConfig3 = {
      name: 'Entity3',
      type: 'tangible',
      relationalFields: [
        { config: entityConfig, name: 'relationalField_3' },
        { array: true, config: entityConfig, name: 'relationalField_3a' },
      ],
    };
    Object.assign(entityConfig, {
      name: 'Entity',
      type: 'tangible',
      relationalFields: [
        {
          name: 'relationalField_1',
          config: entityConfig,
        },
        {
          name: 'relationalField_1a',
          config: entityConfig,
          array: true,
        },
      ],
    });

    const entityConfigs = [entityConfig, entityConfig2, entityConfig3];

    const expectedResult = new Map();
    expectedResult.set(entityConfig, [
      {
        name: 'relationalField_1',
      },
      {
        name: 'relationalField_1a',
        array: true,
      },
    ]);
    expectedResult.set(entityConfig2, [
      {
        name: 'relationalField_2',
      },
      {
        name: 'relationalField_2a',
        array: true,
      },
    ]);
    expectedResult.set(entityConfig3, [
      {
        name: 'relationalField_3',
      },
      {
        name: 'relationalField_3a',
        array: true,
      },
    ]);
    const result = getRelations(entityConfig, entityConfigs);
    expect(result).toEqual(expectedResult);
  });
});
