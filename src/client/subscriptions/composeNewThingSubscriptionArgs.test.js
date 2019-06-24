// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeNewThingSubscriptionArgs from './composeNewThingSubscriptionArgs';

describe('composeNewThingSubscriptionArgs', () => {
  test('should compose things query without args', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = ['subscription newExample {', '  newExample {'];

    const result = composeNewThingSubscriptionArgs(thingConfig);
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
      'subscription newExample($where: ExampleWhereInput) {',
      '  newExample(where: $where) {',
    ];

    const result = composeNewThingSubscriptionArgs(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
