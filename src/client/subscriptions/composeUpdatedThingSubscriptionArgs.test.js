// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeUpdatedThingSubscriptionArgs from './composeUpdatedThingSubscriptionArgs';

describe('composeUpdatedThingSubscriptionArgs', () => {
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
      'subscription updatedExample($where: ExampleWhereInput) {',
      '  updatedExample(where: $where) {',
    ];

    const result = composeUpdatedThingSubscriptionArgs(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should compose things query with ExampleWhereInput arg', () => {
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
      'subscription updatedExample($where: ExampleWhereInput) {',
      '  updatedExample(where: $where) {',
    ];

    const result = composeUpdatedThingSubscriptionArgs(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
