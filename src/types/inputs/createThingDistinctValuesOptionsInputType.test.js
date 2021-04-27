// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import createThingDistinctValuesOptionsInputType from './createThingDistinctValuesOptionsInputType';

describe('createUploadFilesToThingOptionsInputType', () => {
  test('should create empty string if there are not any text fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      floatFields: [
        {
          name: 'firstName',
        },
        {
          name: 'lastName',
        },
      ],
    };
    const expectedResult = ['ExampleDistinctValuesOptionsInput', '', {}];

    const result = createThingDistinctValuesOptionsInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create string with indexed text fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
        {
          name: 'textFieldArray',
          array: true,
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

    const result = createThingDistinctValuesOptionsInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
