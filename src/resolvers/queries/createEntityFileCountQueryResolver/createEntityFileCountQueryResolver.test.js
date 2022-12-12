// @flow
/* eslint-env jest */
import type { GeneralConfig, EntityConfig } from '../../../flowTypes';

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
        Image: ({ hash, _id }) => {
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
