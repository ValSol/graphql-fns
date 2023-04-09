/* eslint-env jest */
import type { GeneralConfig, EntityConfig } from '../../../tsTypes';

import createUploadEntityFilesMutationResolver from './index';

describe('createUploadEntityFilesMutationResolver', () => {
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
          name: 'address',
          type: 'textFields',
        },
      ],
    };
    const generalConfig: GeneralConfig = { allEntityConfigs: { Image: imageConfig } };

    const serversideConfig = {
      saveFiles: {
        Image: async ({ filename, mimetype, encoding }: any, hash: any, uploadedAt: any) => ({
          filename,
          mimetype,
          encoding,
          hash,
          uploadedAt,
        }),
      },

      composeFileFieldsData: { Image: (item: any) => item },
    };

    const result = createUploadEntityFilesMutationResolver(
      imageConfig,
      generalConfig,
      serversideConfig,
    );

    expect(typeof result).toBe('function');
  });
});
