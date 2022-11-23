// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import thingsByUniqueQueryAttributes from '../../types/actionAttributes/thingsByUniqueQueryAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeThingsQueryArgs', () => {
  const prefixName = 'Home';
  test('should compose things query with default args', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'query Home_ExamplesByUnique($where: ExampleWhereByUniqueInput!, $sort: ExampleSortInput) {',
      '  ExamplesByUnique(where: $where, sort: $sort) {',
    ];

    const result = composeActionArgs(prefixName, thingConfig, thingsByUniqueQueryAttributes, {});
    expect(result).toEqual(expectedResult);
  });

  test('should compose things query with ExampleWhereByUniqueInput and ExampleSortInput args', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const expectedResult = [
      'query Home_ExamplesByUnique($where: ExampleWhereByUniqueInput!, $sort: ExampleSortInput) {',
      '  ExamplesByUnique(where: $where, sort: $sort) {',
    ];

    const result = composeActionArgs(prefixName, thingConfig, thingsByUniqueQueryAttributes, {});
    expect(result).toEqual(expectedResult);
  });

  test('should compose things query with PaginationInput args', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'query Home_ExamplesByUnique($where: ExampleWhereByUniqueInput!, $sort: ExampleSortInput) {',
      '  ExamplesByUnique(where: $where, sort: $sort) {',
    ];

    const result = composeActionArgs(prefixName, thingConfig, thingsByUniqueQueryAttributes, {});
    expect(result).toEqual(expectedResult);
  });

  test('should compose things query with ExampleNearInput args', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      type: 'tangible',
      geospatialFields: [
        {
          name: 'position',
          geospatialType: 'Point',
        },
      ],
    };

    const expectedResult = [
      'query Home_ExamplesByUnique($where: ExampleWhereByUniqueInput!, $sort: ExampleSortInput, $near: ExampleNearInput) {',
      '  ExamplesByUnique(where: $where, sort: $sort, near: $near) {',
    ];

    const result = composeActionArgs(prefixName, thingConfig, thingsByUniqueQueryAttributes, {});
    expect(result).toEqual(expectedResult);
  });
});
