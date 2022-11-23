// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeUpdatedThingSubscriptionArgs from './composeUpdatedThingSubscriptionArgs';

describe('composeUpdatedThingSubscriptionArgs', () => {
  const prefixName = 'Home';
  test('should compose things query without args', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'subscription Home_updatedExample($where: ExampleWhereInput) {',
      '  updatedExample(where: $where) {',
    ];

    const result = composeUpdatedThingSubscriptionArgs(prefixName, thingConfig, {});
    expect(result).toEqual(expectedResult);
  });

  test('should compose things query with ExampleWhereInput arg', () => {
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

    const expectedResult = [
      'subscription Home_updatedExample($where: ExampleWhereInput) {',
      '  updatedExample(where: $where) {',
    ];

    const result = composeUpdatedThingSubscriptionArgs(prefixName, thingConfig, {});
    expect(result).toEqual(expectedResult);
  });
});
