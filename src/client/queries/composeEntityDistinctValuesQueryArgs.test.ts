/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import entityDistinctValuesQueryAttributes from '../../types/actionAttributes/entityDistinctValuesQueryAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeEntityDistinctValuesQueryArgs', () => {
  test('should compose entity distinct values query with ExampleWhereInput and where args', () => {
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
      `query Home_ExampleDistinctValues($where: ExampleWhereInput, $options: ExampleDistinctValuesOptionsInput) {
  ExampleDistinctValues(where: $where, options: $options)
}`,
    ];

    const result = composeActionArgs(
      prefixName,
      entityConfig,
      generalConfig,
      entityDistinctValuesQueryAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
