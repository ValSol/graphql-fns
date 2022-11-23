// @flow
/* eslint-env jest */

import type { ThingConfig, GeneralConfig } from '../../flowTypes';

import composeSubscription from './composeSubscription';

describe('composeSubscription', () => {
  const prefixName = 'Home';
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

  const generalConfig: GeneralConfig = { thingConfigs: { Example: thingConfig } };

  test('should compose createdThing subscription', () => {
    const subscriptionName = 'createdThing';
    const expectedResult = `subscription Home_createdExample($where: ExampleWhereInput) {
  createdExample(where: $where) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeSubscription(prefixName, subscriptionName, thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose deletedThing subscription', () => {
    const subscriptionName = 'deletedThing';
    const expectedResult = `subscription Home_deletedExample($where: ExampleWhereInput) {
  deletedExample(where: $where) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeSubscription(prefixName, subscriptionName, thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose updatedThing subscription', () => {
    const subscriptionName = 'updatedThing';
    const expectedResult = `subscription Home_updatedExample($where: ExampleWhereInput) {
  updatedExample(where: $where) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeSubscription(prefixName, subscriptionName, thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });
});
