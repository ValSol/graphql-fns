// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import createThingDistinctValuesQueryType from './createThingDistinctValuesQueryType';

describe('createThingDistinctValuesQueryType', () => {
  test('should return empty string if there is not textFields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
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

    const result = createThingDistinctValuesQueryType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create query', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
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

    const result = createThingDistinctValuesQueryType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
