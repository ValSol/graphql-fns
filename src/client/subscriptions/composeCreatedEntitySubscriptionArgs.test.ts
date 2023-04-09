/* eslint-env jest */

import type { EntityConfig } from '../../tsTypes';

import composeCreatedEntitySubscriptionArgs from './composeCreatedEntitySubscriptionArgs';

describe('composeCreatedEntitySubscriptionArgs', () => {
  const prefixName = 'Home';
  test('should compose entities query without args', () => {
    const entityConfig = {} as EntityConfig;

    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
      ],
      relationalFields: [
        {
          name: 'examples',
          array: true,
          config: entityConfig,
          type: 'relationalFields',
        },
      ],
    });

    const childArgs = { examples_where: 'ExampleWhereInput', examples_sort: 'ExampleSortInput' };

    const expectedResult = [
      'subscription Home_createdExample($where: ExampleWhereInput, $examples_where: ExampleWhereInput, $examples_sort: ExampleSortInput) {',
      '  createdExample(where: $where) {',
    ];

    const result = composeCreatedEntitySubscriptionArgs(prefixName, entityConfig, childArgs);
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
      'subscription Home_createdExample($where: ExampleWhereInput) {',
      '  createdExample(where: $where) {',
    ];

    const result = composeCreatedEntitySubscriptionArgs(prefixName, entityConfig, {});
    expect(result).toEqual(expectedResult);
  });
});
