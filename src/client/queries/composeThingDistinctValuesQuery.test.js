// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeThingDistinctValuesQuery from './composeThingDistinctValuesQuery';

describe('composeThingDistinctValuesQuery', () => {
  test('should compose thing distinct values query with ExampleWhereInput and where args', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = `query ExampleDistinctValues($where: ExampleWhereInput, $options: ExampleDistinctValuesOptionsInput) {
  ExampleDistinctValues(where: $where, options: $options)
}`;

    const result = composeThingDistinctValuesQuery(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
