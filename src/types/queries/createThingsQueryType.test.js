// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import thingsQueryAttributes from '../actionAttributes/thingsQueryAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createThingsQueryType', () => {
  test('should create query things type without index fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
    };
    const expectedResult =
      '  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput): [Example!]!';
    const dic = {};

    const result = composeStandardActionSignature(thingConfig, thingsQueryAttributes, dic);
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
      '  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput): [Example!]!';
    const dic = {};

    const result = composeStandardActionSignature(thingConfig, thingsQueryAttributes, dic);
    expect(result).toEqual(expectedResult);
  });

  test('should create query things type with where arg', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'firstName',
          weight: 1,
        },
        {
          name: 'lastName',
          weight: 5,
        },
      ],
    };
    const expectedResult =
      '  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput, search: String): [Example!]!';
    const dic = {};

    const result = composeStandardActionSignature(thingConfig, thingsQueryAttributes, dic);
    expect(result).toEqual(expectedResult);
  });

  test('should create query things type with pagination arg', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
    };
    const expectedResult =
      '  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput): [Example!]!';
    const dic = {};

    const result = composeStandardActionSignature(thingConfig, thingsQueryAttributes, dic);
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
    const expectedResult =
      '  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput, near: ExampleNearInput): [Example!]!';
    const dic = {};

    const result = composeStandardActionSignature(thingConfig, thingsQueryAttributes, dic);
    expect(result).toEqual(expectedResult);
  });

  test('should create query things type with were, pagination and near args', () => {
    const thingConfig = {
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
      '  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput, near: ExampleNearInput): [Example!]!';
    const dic = {};

    const result = composeStandardActionSignature(thingConfig, thingsQueryAttributes, dic);
    expect(result).toEqual(expectedResult);
  });
});
