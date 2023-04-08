/* eslint-env jest */
import type { GeneralConfig, EntityConfig } from '../../../tsTypes';

import createEntityFilesQueryResolver from './index';

describe('createEntityFilesQueryResolver', () => {
  const generalConfig: GeneralConfig = { allEntityConfigs: {} };
  test('should create mutation add entity type', () => {
    const imageConfig: EntityConfig = {
      name: 'Image',
      type: 'file',
      textFields: [
        {
          name: 'fileId',
        },
        {
          name: 'desktop',
        },
        {
          name: 'tablet',
        },
        {
          name: 'mobile',
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
    const result = createEntityFilesQueryResolver(imageConfig, generalConfig, serversideConfig);

    expect(typeof result).toBe('function');
  });
});
