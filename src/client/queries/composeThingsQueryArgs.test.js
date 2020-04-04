// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeThingsQueryArgs from './composeThingsQueryArgs';

describe('composeThingsQueryArgs', () => {
  test('should compose things query without args', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'query Examples($where: ExampleWhereInput) {',
      '  Examples(where: $where) {',
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
      'query Examples($pagination: ExamplePaginationInput, $where: ExampleWhereInput) {',
      '  Examples(pagination: $pagination, where: $where) {',
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
      'query Examples($near: ExampleNearInput, $where: ExampleWhereInput) {',
      '  Examples(near: $near, where: $where) {',
    ];

    const result = composeThingsQueryArgs(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
