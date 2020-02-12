// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import createThingsQueryType from './createThingsQueryType';

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
    const expectedResult =
      '  Examples(where: ExampleWhereInput, sort: ExampleSortInput): [Example!]!';

    const result = createThingsQueryType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create query things type with where arg 2', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      fileFields: [
        {
          name: 'firstName',
          generalName: 'generalFile',
          fileType: 'fileType',
          index: true,
        },
        {
          name: 'lastName',
          generalName: 'generalFile',
          fileType: 'fileType',
          index: true,
        },
      ],
    };
    const expectedResult =
      '  Examples(where: ExampleWhereInput, sort: ExampleSortInput): [Example!]!';

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
          geospatialType: 'Point',
        },
        {
          name: 'area',
          geospatialType: 'Polygon',
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
          geospatialType: 'Point',
        },
        {
          name: 'area',
          geospatialType: 'Polygon',
        },
      ],
    };
    const expectedResult =
      '  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: ExamplePaginationInput, near: ExampleNearInput): [Example!]!';

    const result = createThingsQueryType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
