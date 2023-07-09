/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import deleteEntityMutationAttributes from '../../types/actionAttributes/deleteEntityMutationAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeDeleteEntityMutationArgs', () => {
  test('should compose deleteEntity mutation args ', () => {
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
      'mutation Home_deleteExample($whereOne: ExampleWhereOneInput!, $token: String) {',
      '  deleteExample(whereOne: $whereOne, token: $token) {',
    ];

    const result = composeActionArgs(
      prefixName,
      entityConfig,
      generalConfig,
      deleteEntityMutationAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
