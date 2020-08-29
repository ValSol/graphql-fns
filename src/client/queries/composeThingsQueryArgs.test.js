// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeThingsQueryArgs from './composeThingsQueryArgs';

describe('composeThingsQueryArgs', () => {
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
      'query Examples($where: ExampleWhereInput, $sort: ExampleSortInput) {',
      '  Examples(where: $where, sort: $sort) {',
    ];

    const result = composeThingsQueryArgs(thingConfig);
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
      'query Examples($where: ExampleWhereInput, $sort: ExampleSortInput) {',
      '  Examples(where: $where, sort: $sort) {',
    ];

    const result = composeThingsQueryArgs(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should compose things query with ExamplePaginationInput args', () => {
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
      'query Examples($where: ExampleWhereInput, $sort: ExampleSortInput, $pagination: ExamplePaginationInput) {',
      '  Examples(where: $where, sort: $sort, pagination: $pagination) {',
    ];

    const result = composeThingsQueryArgs(thingConfig);
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
      'query Examples($where: ExampleWhereInput, $sort: ExampleSortInput, $near: ExampleNearInput) {',
      '  Examples(where: $where, sort: $sort, near: $near) {',
    ];

    const result = composeThingsQueryArgs(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
