/* eslint-env jest */

import type {EntityConfig} from '../../tsTypes';

import composeDeletedEntitySubscriptionArgs from './composeDeletedEntitySubscriptionArgs';

describe('composeDeletedEntitySubscriptionArgs', () => {
  const prefixName = 'Home';
  test('should compose entities query without args', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'subscription Home_deletedExample($where: ExampleWhereInput) {',
      '  deletedExample(where: $where) {',
    ];

    const result = composeDeletedEntitySubscriptionArgs(prefixName, entityConfig, {});
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
        },
      ],
    };

    const expectedResult = [
      'subscription Home_deletedExample($where: ExampleWhereInput) {',
      '  deletedExample(where: $where) {',
    ];

    const result = composeDeletedEntitySubscriptionArgs(prefixName, entityConfig, {});
    expect(result).toEqual(expectedResult);
  });
});
