// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeCreatedThingSubscriptionArgs from './composeCreatedThingSubscriptionArgs';

describe('composeCreatedThingSubscriptionArgs', () => {
  test('should compose things query without args', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = ['subscription createdExample {', '  createdExample {'];

    const result = composeCreatedThingSubscriptionArgs(thingConfig);
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
      'subscription createdExample($where: ExampleWhereInput) {',
      '  createdExample(where: $where) {',
    ];

    const result = composeCreatedThingSubscriptionArgs(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
