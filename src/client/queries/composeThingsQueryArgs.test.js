// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

const composeThingsQueryArgs = require('./composeThingsQueryArgs');

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

    const expectedResult = ['query Examples {', '  Examples {'];

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
      'query Examples($pagination: ExamplePaginationInput) {',
      '  Examples(pagination: $pagination) {',
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
      'query Examples($near: ExampleNearInput) {',
      '  Examples(near: $near) {',
    ];

    const result = composeThingsQueryArgs(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
