// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

const composeQuery = require('./composeQuery');

describe('composeQuery', () => {
  test('should compose thing query', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = `query Example($whereOne: ExampleWhereOneInput!) {
  Example(whereOne: $whereOne) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeQuery('thing', thingConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose things query', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const expectedResult = `query Examples($where: ExampleWhereInput, $sort: ExampleSortInput) {
  Examples(where: $where, sort: $sort) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeQuery('things', thingConfig);
    expect(result).toBe(expectedResult);
  });
});
