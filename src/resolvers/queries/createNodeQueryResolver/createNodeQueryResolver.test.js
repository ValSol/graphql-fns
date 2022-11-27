// @flow
/* eslint-env jest */
import type { GeneralConfig, EntityConfig } from '../../../flowTypes';

import createNodeQueryResolver from './index';

describe('createNodeQueryResolver', () => {
  test('should create mutation add entity type', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
        },
        {
          name: 'textField2',
          default: 'default text',
        },
        {
          name: 'textField3',
          required: true,
        },
        {
          name: 'textField4',
          array: true,
        },
        {
          name: 'textField5',
          default: ['default text'],
          required: true,
          array: true,
        },
      ],
    };
    const serversideConfig = {};
    const generalConfig: GeneralConfig = { entityConfigs: { Example: entityConfig } };
    const result = createNodeQueryResolver(generalConfig, serversideConfig);

    expect(typeof result).toBe('function');
  });
});
