/* eslint-env jest */
import type { GeneralConfig, EntityConfig } from '../../../tsTypes';

import createDeleteFilteredEntitiesReturnScalarMutationResolver from '.';

describe('createDeleteFilteredEntitiesReturnScalarMutationResolver', () => {
  const generalConfig: GeneralConfig = { allEntityConfigs: {} };
  test('should create mutation add entity type', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
          type: 'textFields',
        },
        {
          name: 'textField2',
          default: 'default text',
          type: 'textFields',
        },
        {
          name: 'textField3',
          required: true,
          type: 'textFields',
        },
        {
          name: 'textField4',
          array: true,
          type: 'textFields',
        },
        {
          name: 'textField5',
          default: ['default text'],
          required: true,
          array: true,
          type: 'textFields',
        },
      ],
    };
    const serversideConfig: Record<string, any> = {};
    const result = createDeleteFilteredEntitiesReturnScalarMutationResolver(
      entityConfig,
      generalConfig,
      serversideConfig,
    );

    expect(typeof result).toBe('function');
  });
});
