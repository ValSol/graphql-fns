/* eslint-env jest */
import type { EntityConfig } from '../../tsTypes';

import createEntityDistinctValuesOptionsInputType from './createEntityDistinctValuesOptionsInputType';

describe('createEntityDistinctValuesOptionsInputType', () => {
  test('should create empty string if there are not any text fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      floatFields: [
        {
          name: 'firstName',
          type: 'floatFields',
        },
        {
          name: 'lastName',
          type: 'floatFields',
        },
      ],
    };
    const expectedResult = ['ExampleDistinctValuesOptionsInput', '', {}];

    const result = createEntityDistinctValuesOptionsInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create string with indexed text fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
        {
          name: 'textFieldArray',
          array: true,
          type: 'textFields',
        },
      ],
    };
    const expectedResult = [
      'ExampleDistinctValuesOptionsInput',
      `enum ExampleTextNamesEnum {
  textField
  textFieldArray
}
input ExampleDistinctValuesOptionsInput {
  target: ExampleTextNamesEnum!
}`,
      {},
    ];

    const result = createEntityDistinctValuesOptionsInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
