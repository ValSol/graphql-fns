/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import composeSubscription from './composeSubscription';

describe('composeSubscription', () => {
  const prefixName = 'Home';
  const entityConfig: EntityConfig = {
    name: 'Example',
    type: 'tangible',
    textFields: [
      {
        name: 'textField',
        index: true,
        type: 'textFields',
      },
    ],
  };

  const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

  test('should compose createdEntity subscription', () => {
    const subscriptionName = 'createdEntity';
    const expectedResult = `subscription Home_createdExample($where: ExampleWhereInput) {
  createdExample(where: $where) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeSubscription(prefixName, subscriptionName, entityConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose deletedEntity subscription', () => {
    const subscriptionName = 'deletedEntity';
    const expectedResult = `subscription Home_deletedExample($where: ExampleWhereInput) {
  deletedExample(where: $where) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeSubscription(prefixName, subscriptionName, entityConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should compose updatedEntity subscription', () => {
    const subscriptionName = 'updatedEntity';
    const expectedResult = `subscription Home_updatedExample($where: ExampleWhereInput) {
  updatedExample(where: $where) {
    id
    createdAt
    updatedAt
    textField
  }
}`;

    const result = composeSubscription(prefixName, subscriptionName, entityConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });
});
