// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createImportOptionsInputTypes from './createImportOptionsInputTypes';

describe('createImportOptionsInputTypes', () => {
  test('should return ImportOptionsInput type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'ImportOptionsInput',
      `enum ImportFormatEnum {
  csv
  json
}
input ImportOptionsInput {
  format: ImportFormatEnum
}`,
      {},
    ];

    const result = createImportOptionsInputTypes(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
