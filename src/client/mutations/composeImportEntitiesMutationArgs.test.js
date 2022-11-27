// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import importEntitiesMutationAttributes from '../../types/actionAttributes/importEntitiesMutationAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeImportEntitysMutationArgs', () => {
  test('should compose createEntity mutation args ', () => {
    const prefixName = 'Home';
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
      'mutation Home_importExamples($file: Upload!, $options: ImportOptionsInput) {',
      '  importExamples(file: $file, options: $options) {',
    ];

    const result = composeActionArgs(
      prefixName,
      entityConfig,
      importEntitiesMutationAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
