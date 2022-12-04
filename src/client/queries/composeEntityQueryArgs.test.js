// @flow
/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import entityQueryAttributes from '../../types/actionAttributes/entityQueryAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeEntityQueryArgs', () => {
  const generalConfig: GeneralConfig = {};

  test('should compose entity query args ', () => {
    const prefixName = 'Home';
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
      'query Home_Example($whereOne: ExampleWhereOneInput!) {',
      '  Example(whereOne: $whereOne) {',
    ];

    const result = composeActionArgs(
      prefixName,
      entityConfig,
      generalConfig,
      entityQueryAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});