// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeThingDistinctValuesQuery from './composeThingDistinctValuesQuery';

describe('composeThingDistinctValuesQuery', () => {
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

    const result = composeThingDistinctValuesQuery(prefixName, thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
