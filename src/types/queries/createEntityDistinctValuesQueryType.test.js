// @flow
/* eslint-env jest */
import type { EntityConfig } from '../../flowTypes';

import entityDistinctValuesQueryAttributes from '../actionAttributes/entityDistinctValuesQueryAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createEntityDistinctValuesQueryType', () => {
  test('should return empty string if there is not textFields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      floatFields: [
        {
          name: 'firstName',
        },
        {
          name: 'lastName',
        },
      ],
    };
    const expectedResult = '';
    const dic = {};

    const result = composeStandardActionSignature(
      entityConfig,
      entityDistinctValuesQueryAttributes,
      dic,
    );
    expect(result).toEqual(expectedResult);
  });

  test('should create query', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
        {
          name: 'textFieldArray',
          array: true,
        },
      ],
    };
    const expectedResult =
      '  ExampleDistinctValues(where: ExampleWhereInput, options: ExampleDistinctValuesOptionsInput): [String!]!';
    const dic = {};

    const result = composeStandardActionSignature(
      entityConfig,
      entityDistinctValuesQueryAttributes,
      dic,
    );
    expect(result).toEqual(expectedResult);
  });
});
