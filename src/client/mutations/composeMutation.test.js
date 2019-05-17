// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

const composeMutation = require('./composeMutation');

describe('composeMutation', () => {
  const thingConfig: ThingConfig = {
    name: 'Example',
    textFields: [
      {
        name: 'textField',
      },
    ],
  };
  test('should compose createThing mutation', () => {
    const mutationName = 'createThing';
    const expectedResult = `mutation createExample($data: ExampleCreateInput!) {
  createExample(data: $data) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeMutation(mutationName, thingConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose deleteThing mutation', () => {
    const mutationName = 'deleteThing';
    const expectedResult = `mutation deleteExample($whereOne: ExampleWhereOneInput!) {
  deleteExample(whereOne: $whereOne) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeMutation(mutationName, thingConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose updateThing mutation', () => {
    const mutationName = 'updateThing';
    const expectedResult = `mutation updateExample($whereOne: ExampleWhereOneInput!, $data: ExampleUpdateInput!) {
  updateExample(whereOne: $whereOne, data: $data) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeMutation(mutationName, thingConfig);
    expect(result).toBe(expectedResult);
  });
});
