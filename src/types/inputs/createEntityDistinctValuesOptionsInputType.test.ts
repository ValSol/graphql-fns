import type { EntityConfig } from '../../tsTypes';

import createEntityDistinctValuesOptionsInputType from './createEntityDistinctValuesOptionsInputType';
import createEntityTextNamesEnumType from './createEntityTextNamesEnumType';

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
          index: true,
          type: 'textFields',
        },
        {
          name: 'textFieldArray',
          array: true,
          index: true,
          type: 'textFields',
        },
        {
          name: 'uniqueTextField',
          unique: true,
          type: 'textFields',
        },
        {
          name: 'notIndexedTextField',
          type: 'textFields',
        },
      ],
      enumFields: [
        { name: 'enumField', enumName: 'Weekday', index: true, type: 'enumFields' },
        { name: 'notIndexedEnumField', enumName: 'Weekday', type: 'enumFields' },
      ],
    };
    const expectedResult = [
      'ExampleDistinctValuesOptionsInput',
      `input ExampleDistinctValuesOptionsInput {
  target: ExampleTextNamesEnum!
}`,
      { ExampleTextNamesEnum: [createEntityTextNamesEnumType, entityConfig] },
    ];

    const result = createEntityDistinctValuesOptionsInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
