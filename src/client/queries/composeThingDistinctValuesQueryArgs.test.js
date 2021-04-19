// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeThingDistinctValuesQueryArgs from './composeThingDistinctValuesQueryArgs';

describe('composeThingDistinctValuesQueryArgs', () => {
  test('should compose thing distinct values query with ExampleWhereInput and where args', () => {
    const prefixName = 'Home';
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = `query Home_ExampleDistinctValues($where: ExampleWhereInput, $options: ExampleDistinctValuesOptionsInput) {
  ExampleDistinctValues(where: $where, options: $options)
}`;

    const result = composeThingDistinctValuesQueryArgs(prefixName, thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
