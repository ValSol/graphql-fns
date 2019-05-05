// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

const createThingSortInputType = require('./createThingSortInputType');

describe('createThingSortInputType', () => {
  test('should create empty string if there are not any indexed fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'firstName',
        },
        {
          name: 'lastName',
        },
      ],
    };
    const expectedResult = '';

    const result = createThingSortInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
  test('should create string if there are not indexed fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
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
    const expectedResult = `
enum ExampleSortEnumeration {
  firstName
  -firstName
  lastName
  -lastName
}
input ExampleSortInput {
  sortBy: [ExampleSortEnumeration]
}`;

    const result = createThingSortInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
