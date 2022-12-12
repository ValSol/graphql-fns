// @flow
/* eslint-env jest */
import type { GeneralConfig, EntityConfig } from '../../../flowTypes';

import createUploadFilesToEntityMutationResolver from './index';

describe('createUploadFilesToEntityMutationResolver', () => {
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
          name: 'address',
        },
      ],
    };
    const exampleConfig: EntityConfig = {};
    Object.assign(exampleConfig, {
      name: 'Example',
      type: 'tangible',
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
        },
        {
          name: 'pictures',
          config: imageConfig,
          array: true,
        },
      ],
    });

    const serversideConfig = {
      saveFiles: {
        Image: async ({ filename, mimetype, encoding }, hash, uploadedAt) => ({
          filename,
          mimetype,
          encoding,
          hash,
          uploadedAt,
        }),
      },

      composeFileFieldsData: { Image: (item) => item },
    };

    const result = createUploadFilesToEntityMutationResolver(
      exampleConfig,
      generalConfig,
      serversideConfig,
    );

    expect(typeof result).toBe('function');
  });
});
