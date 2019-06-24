// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeSubscription from './composeSubscription';

describe('composeSubscription', () => {
  const thingConfig: ThingConfig = {
    name: 'Example',
    textFields: [
      {
        name: 'textField',
        index: true,
      },
    ],
  };
  test('should compose createdThing subscription', () => {
    const subscriptionName = 'createdThing';
    const expectedResult = `subscription createdExample($where: ExampleWhereInput) {
  createdExample(where: $where) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeSubscription(subscriptionName, thingConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose deletedThing subscription', () => {
    const subscriptionName = 'deletedThing';
    const expectedResult = `subscription deletedExample($where: ExampleWhereInput) {
  deletedExample(where: $where) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeSubscription(subscriptionName, thingConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose updatedThing subscription', () => {
    const subscriptionName = 'updatedThing';
    const expectedResult = `subscription updatedExample($whereOne: ExampleWhereOneInput, $where: ExampleWhereInput) {
  updatedExample(whereOne: $whereOne, where: $where) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeSubscription(subscriptionName, thingConfig);
    expect(result).toBe(expectedResult);
  });
});
