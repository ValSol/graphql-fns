/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

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
          type: 'textFields',
        },
      ],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const expectedResult = [
      'mutation Home_importExamples($file: Upload!, $options: ImportOptionsInput, $token: String) {',
      '  importExamples(file: $file, options: $options, token: $token) {',
    ];

    const result = composeActionArgs(
      prefixName,
      entityConfig,
      generalConfig,
      importEntitiesMutationAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
