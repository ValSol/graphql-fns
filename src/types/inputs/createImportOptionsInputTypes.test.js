// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import createImportOptionsInputTypes from './createImportOptionsInputTypes';

describe('createImportOptionsInputTypes', () => {
  test('should return ImportOptionsInput type', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
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

    const result = createImportOptionsInputTypes(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
