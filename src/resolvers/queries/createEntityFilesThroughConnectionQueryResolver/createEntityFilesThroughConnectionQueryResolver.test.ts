/* eslint-env jest */
import type { GeneralConfig, EntityConfig } from '../../../tsTypes';

import createEntityFilesThroughConnectionQueryResolver from './index';

describe('createEntityFilesThroughConnectionQueryResolver', () => {
  const generalConfig: GeneralConfig = { allEntityConfigs: {} };
  test('should create query resolver', () => {
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

    const serversideConfig = {
      composeFileFieldsData: {
        Image: ({ hash, _id }: any) => {
          if (!_id) throw new TypeError('Have to define _id in composeFileFieldsData args!');
          const fullPath = `/images/`;
          return {
            fileId: _id,
            desktop: `${fullPath}${hash}_desktop`,
            tablet: `${fullPath}${hash}_tablet`,
            mobile: `${fullPath}${hash}_mobile`,
          };
        },
      },
    };

    const result = createEntityFilesThroughConnectionQueryResolver(
      entityConfig,
      generalConfig,
      serversideConfig,
    );

    expect(typeof result).toBe('function');
  });
});
