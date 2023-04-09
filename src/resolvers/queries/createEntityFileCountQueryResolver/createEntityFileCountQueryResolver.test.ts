/* eslint-env jest */
import type {
  EntityConfig,
  GeneralConfig,
  FileAttributes,
  ServersideConfig,
} from '../../../tsTypes';

import createEntityFileCountQueryResolver from './index';

describe('createEntityFileCountQueryResolver', () => {
  const generalConfig: GeneralConfig = { allEntityConfigs: {} };
  test('should create mutation add entity type', () => {
    const imageConfig: EntityConfig = {
      name: 'Image',
      type: 'file',
      textFields: [
        {
          name: 'fileId',
          type: 'textFields',
        },
        {
          name: 'desktop',
          type: 'textFields',
        },
        {
          name: 'tablet',
          type: 'textFields',
        },
        {
          name: 'mobile',
          type: 'textFields',
        },
      ],
    };
    const serversideConfig: ServersideConfig = {
      composeFileFieldsData: {
        Image: ({ hash, _id }: FileAttributes) => {
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
    const result = createEntityFileCountQueryResolver(imageConfig, generalConfig, serversideConfig);

    expect(typeof result).toBe('function');
  });
});
