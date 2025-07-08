/* eslint-env jest */
import type { GeneralConfig, EntityConfig } from '../../../tsTypes';

import createCreatedEntitySubscriptionResolver from '.';

describe('createCreatedEntitySubscriptionResolver', () => {
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

    const result = createCreatedEntitySubscriptionResolver(entityConfig, generalConfig);
    expect(result).not.toBeNull();
    if (result) expect(typeof result.subscribe).toBe('function'); // "if (result)" to prevent flowjs error
  });
});
