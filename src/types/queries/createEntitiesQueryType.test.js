// @flow
/* eslint-env jest */
import type { EntityConfig } from '../../flowTypes';

import entitiesQueryAttributes from '../actionAttributes/entitiesQueryAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createEntitiesQueryType', () => {
  test('should create query entities type without index fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
    };
    const expectedResult =
      '  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput): [Example!]!';
    const dic = {};

    const result = composeStandardActionSignature(entityConfig, entitiesQueryAttributes, dic);
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
    const expectedResult =
      '  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput): [Example!]!';
    const dic = {};

    const result = composeStandardActionSignature(entityConfig, entitiesQueryAttributes, dic);
    expect(result).toEqual(expectedResult);
  });

  test('should create query entities type with where arg', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
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

    const result = composeStandardActionSignature(entityConfig, entitiesQueryAttributes, dic);
    expect(result).toEqual(expectedResult);
  });

  test('should create query entities type with pagination arg', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
    };
    const expectedResult =
      '  Examples(where: ExampleWhereInput, sort: ExampleSortInput, pagination: PaginationInput): [Example!]!';
    const dic = {};

    const result = composeStandardActionSignature(entityConfig, entitiesQueryAttributes, dic);
    expect(result).toEqual(expectedResult);
  });

  test('should create query entities type with near arg', () => {
    const entityConfig = {
      name: 'Example',
      type: 'tangible',
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

    const result = composeStandardActionSignature(entityConfig, entitiesQueryAttributes, dic);
    expect(result).toEqual(expectedResult);
  });

  test('should create query entities type with were, pagination and near args', () => {
    const entityConfig = {
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

    const result = composeStandardActionSignature(entityConfig, entitiesQueryAttributes, dic);
    expect(result).toEqual(expectedResult);
  });
});
