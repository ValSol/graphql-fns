/* eslint-env jest */

import type { EntityConfig } from '../../tsTypes';

import createImportOptionsInputTypes from './createImportOptionsInputTypes';

describe('createImportOptionsInputTypes', () => {
  test('should return ImportOptionsInput type', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
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
