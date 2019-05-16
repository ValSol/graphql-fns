// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

const composeUpdatedThingSubscriptionArgs = require('./composeUpdatedThingSubscriptionArgs');

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
      'subscription updatedExample($whereOne: ExampleWhereOneInput) {',
      '  updatedExample(whereOne: $whereOne) {',
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
      'subscription updatedExample($whereOne: ExampleWhereOneInput, $where: ExampleWhereInput) {',
      '  updatedExample(whereOne: $whereOne, where: $where) {',
    ];

    const result = composeUpdatedThingSubscriptionArgs(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
