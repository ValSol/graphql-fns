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
      pagination: true,
    };
    const expectedResult = `
input ExamplePaginationInput {
  skip: Int
  first: Int
}`;

    const result = createThingPaginationInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
