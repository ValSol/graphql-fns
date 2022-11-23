// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import thingDistinctValuesQueryAttributes from '../../types/actionAttributes/thingDistinctValuesQueryAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeThingDistinctValuesQueryArgs', () => {
  test('should compose thing distinct values query with ExampleWhereInput and where args', () => {
    const prefixName = 'Home';
    const thingConfig: ThingConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      `query Home_ExampleDistinctValues($where: ExampleWhereInput, $options: ExampleDistinctValuesOptionsInput) {
  ExampleDistinctValues(where: $where, options: $options)
}`,
    ];

    const result = composeActionArgs(
      prefixName,
      thingConfig,
      thingDistinctValuesQueryAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
