/* eslint-env jest */

import type { EntityConfig } from '../../tsTypes';

import composeUpdatedEntitySubscriptionArgs from './composeUpdatedEntitySubscriptionArgs';

describe('composeUpdatedEntitySubscriptionArgs', () => {
  const prefixName = 'Home';
  test('should compose entities query without args', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
      ],
    };

    const expectedResult = [
      'subscription Home_updatedExample($where: ExampleWhereInput) {',
      '  updatedExample(where: $where) {',
    ];

    const result = composeUpdatedEntitySubscriptionArgs(prefixName, entityConfig, {});
    expect(result).toEqual(expectedResult);
  });

  test('should compose entities query with ExampleWhereInput arg', () => {
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

    const expectedResult = [
      'subscription Home_updatedExample($where: ExampleWhereInput) {',
      '  updatedExample(where: $where) {',
    ];

    const result = composeUpdatedEntitySubscriptionArgs(prefixName, entityConfig, {});
    expect(result).toEqual(expectedResult);
  });
});
