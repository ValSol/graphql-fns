// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

const createThingsQueryType = require('./createThingsQueryType');

describe('createThingsQueryType', () => {
  test('should create query things type without index fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
    };
    const expectedResult = '  Examples: [Example!]!';

    const result = createThingsQueryType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create query things type with where arg', () => {
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
    const expectedResult = '  Examples(where: ExampleWhereInput): [Example!]!';

    const result = createThingsQueryType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create query things type with pagination arg', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      pagination: true,
    };
    const expectedResult = '  Examples(pagination: ExamplePaginationInput): [Example!]!';

    const result = createThingsQueryType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create query things type with near arg', () => {
    const thingConfig = {
      name: 'Example',
      geospatialFields: [
        {
          name: 'position',
          type: 'Point',
        },
        {
          name: 'area',
          type: 'Polygon',
        },
      ],
    };
    const expectedResult = '  Examples(near: ExampleNearInput): [Example!]!';

    const result = createThingsQueryType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create query things type with were, pagination and near args', () => {
    const thingConfig = {
      name: 'Example',
      pagination: true,
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
      geospatialFields: [
        {
          name: 'position',
          type: 'Point',
        },
        {
          name: 'area',
          type: 'Polygon',
        },
      ],
    };
    const expectedResult =
      '  Examples(where: ExampleWhereInput, pagination: ExamplePaginationInput, near: ExampleNearInput): [Example!]!';

    const result = createThingsQueryType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
