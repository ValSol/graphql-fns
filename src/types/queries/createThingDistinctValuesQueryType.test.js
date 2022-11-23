// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import thingDistinctValuesQueryAttributes from '../actionAttributes/thingDistinctValuesQueryAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createThingDistinctValuesQueryType', () => {
  test('should return empty string if there is not textFields', () => {
    const thingConfig: ThingConfig = {
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
      thingConfig,
      thingDistinctValuesQueryAttributes,
      dic,
    );
    expect(result).toEqual(expectedResult);
  });

  test('should create query', () => {
    const thingConfig: ThingConfig = {
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
      thingConfig,
      thingDistinctValuesQueryAttributes,
      dic,
    );
    expect(result).toEqual(expectedResult);
  });
});
