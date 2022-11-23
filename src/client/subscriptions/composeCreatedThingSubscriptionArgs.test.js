// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeCreatedThingSubscriptionArgs from './composeCreatedThingSubscriptionArgs';

describe('composeCreatedThingSubscriptionArgs', () => {
  const prefixName = 'Home';
  test('should compose things query without args', () => {
    const thingConfig = {};

    Object.assign(thingConfig, {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
      relationalFields: [
        {
          name: 'examples',
          array: true,
          config: thingConfig,
        },
      ],
    });

    const childArgs = { examples_where: 'ExampleWhereInput', examples_sort: 'ExampleSortInput' };

    const expectedResult = [
      'subscription Home_createdExample($where: ExampleWhereInput, $examples_where: ExampleWhereInput, $examples_sort: ExampleSortInput) {',
      '  createdExample(where: $where) {',
    ];

    const result = composeCreatedThingSubscriptionArgs(prefixName, thingConfig, childArgs);
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
      'subscription Home_createdExample($where: ExampleWhereInput) {',
      '  createdExample(where: $where) {',
    ];

    const result = composeCreatedThingSubscriptionArgs(prefixName, thingConfig, {});
    expect(result).toEqual(expectedResult);
  });
});
