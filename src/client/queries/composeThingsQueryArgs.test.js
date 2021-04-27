// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import thingsQueryAttributes from '../../types/actionAttributes/thingsQueryAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeThingsQueryArgs', () => {
  const prefixName = 'Home';
  test('should compose things query with default args', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'query Home_Examples($where: ExampleWhereInput, $sort: ExampleSortInput) {',
      '  Examples(where: $where, sort: $sort) {',
    ];

    const result = composeActionArgs(prefixName, thingConfig, thingsQueryAttributes);
    expect(result).toEqual(expectedResult);
  });

  test('should compose things query with ExampleWhereInput and ExampleSortInput args', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const expectedResult = [
      'query Home_Examples($where: ExampleWhereInput, $sort: ExampleSortInput) {',
      '  Examples(where: $where, sort: $sort) {',
    ];

    const result = composeActionArgs(prefixName, thingConfig, thingsQueryAttributes);
    expect(result).toEqual(expectedResult);
  });

  test('should compose things query with PaginationInput args', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      pagination: true,
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'query Home_Examples($where: ExampleWhereInput, $sort: ExampleSortInput, $pagination: PaginationInput) {',
      '  Examples(where: $where, sort: $sort, pagination: $pagination) {',
    ];

    const result = composeActionArgs(prefixName, thingConfig, thingsQueryAttributes);
    expect(result).toEqual(expectedResult);
  });

  test('should compose things query with ExampleNearInput args', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      geospatialFields: [
        {
          name: 'position',
          geospatialType: 'Point',
        },
      ],
    };

    const expectedResult = [
      'query Home_Examples($where: ExampleWhereInput, $sort: ExampleSortInput, $near: ExampleNearInput) {',
      '  Examples(where: $where, sort: $sort, near: $near) {',
    ];

    const result = composeActionArgs(prefixName, thingConfig, thingsQueryAttributes);
    expect(result).toEqual(expectedResult);
  });
});
