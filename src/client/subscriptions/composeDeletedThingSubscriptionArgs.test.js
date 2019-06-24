// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeDeletedThingSubscriptionArgs from './composeDeletedThingSubscriptionArgs';

describe('composeDeletedThingSubscriptionArgs', () => {
  test('should compose things query without args', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = ['subscription deletedExample {', '  deletedExample {'];

    const result = composeDeletedThingSubscriptionArgs(thingConfig);
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
      'subscription deletedExample($where: ExampleWhereInput) {',
      '  deletedExample(where: $where) {',
    ];

    const result = composeDeletedThingSubscriptionArgs(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
