import type { EntityConfig } from '../../tsTypes';

import createEntityTextNamesEnumType from './createEntityTextNamesEnumType';

describe('createEntityTextNamesEnumType', () => {
  test('should create empty string if there are not any indexed text or enum fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [{ name: 'title', type: 'textFields' }],
      floatFields: [{ name: 'price', index: true, type: 'floatFields' }],
    };
    const expectedResult = ['ExampleTextNamesEnum', '', {}];

    const result = createEntityTextNamesEnumType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create enum with indexed text and enum fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        { name: 'textField', index: true, type: 'textFields' },
        { name: 'textFieldArray', array: true, index: true, type: 'textFields' },
        { name: 'uniqueTextField', unique: true, type: 'textFields' },
        { name: 'notIndexedTextField', type: 'textFields' },
      ],
      enumFields: [
        { name: 'enumField', enumName: 'Weekday', index: true, type: 'enumFields' },
        { name: 'notIndexedEnumField', enumName: 'Weekday', type: 'enumFields' },
      ],
    };
    const expectedResult = [
      'ExampleTextNamesEnum',
      `enum ExampleTextNamesEnum {
  enumField
  textField
  textFieldArray
  uniqueTextField
}`,
      {},
    ];

    const result = createEntityTextNamesEnumType(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
