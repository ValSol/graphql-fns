// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

const createThingPaginationInputType = require('./createThingPaginationInputType');

describe('createThingPaginationInputType', () => {
  test('should create empty string if there are not pagination', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
    };
    const expectedResult = '';

    const result = createThingPaginationInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create pageInputType string if there are pagination', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      pagination: {
        skip: 0,
        first: 100,
      },
    };
    const expectedResult = `
input ExamplePaginationInput {
  skip: Int = 0
  first: Int = 100
}`;

    const result = createThingPaginationInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
