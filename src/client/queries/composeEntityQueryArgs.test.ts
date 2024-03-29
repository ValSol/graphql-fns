/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import entityQueryAttributes from '../../types/actionAttributes/entityQueryAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeEntityQueryArgs', () => {
  test('should compose entity query args ', () => {
    const prefixName = 'Home';
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
      ],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const expectedResult = [
      'query Home_Example($whereOne: ExampleWhereOneInput!, $token: String) {',
      '  Example(whereOne: $whereOne, token: $token) {',
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
