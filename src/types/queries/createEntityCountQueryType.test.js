// @flow
/* eslint-env jest */
import type { EntityConfig } from '../../flowTypes';

import entityCountQueryAttributes from '../actionAttributes/entityCountQueryAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createEntityCountQueryType', () => {
  test('should create query entities type without index fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
        },
        {
          name: 'lastName',
        },
      ],
    };
    const expectedResult = '  ExampleCount(where: ExampleWhereInput): Int!';
    const dic = {};

    const result = composeStandardActionSignature(entityConfig, entityCountQueryAttributes, dic);
    expect(result).toEqual(expectedResult);
  });

  test('should create query entities type with where arg', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          index: true,
        },
        {
          name: 'lastName',
          index: true,
        },
      ],
    };
    const expectedResult = '  ExampleCount(where: ExampleWhereInput): Int!';

    const dic = {};

    const result = composeStandardActionSignature(entityConfig, entityCountQueryAttributes, dic);
    expect(result).toEqual(expectedResult);
  });
});
