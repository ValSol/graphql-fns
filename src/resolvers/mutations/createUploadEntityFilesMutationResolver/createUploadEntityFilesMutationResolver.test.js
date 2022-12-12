// @flow
/* eslint-env jest */
import type { GeneralConfig, EntityConfig } from '../../../flowTypes';

import createUploadEntityFilesMutationResolver from './index';

describe('createUploadEntityFilesMutationResolver', () => {
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
    const generalConfig: GeneralConfig = { allEntityConfigs: { Image: imageConfig } };

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

    const result = createUploadEntityFilesMutationResolver(
      imageConfig,
      generalConfig,
      serversideConfig,
    );

    expect(typeof result).toBe('function');
  });
});
