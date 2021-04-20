// @flow
/* eslint-env jest */
import type { GeneralConfig, ThingConfig } from '../../../flowTypes';

import createUploadThingFilesMutationResolver from './index';

describe('createUploadThingFilesMutationResolver', () => {
  test('should create mutation add thing type', () => {
    const imageConfig: ThingConfig = {
      name: 'Image',
      file: true,
      textFields: [
        {
          name: 'fileId',
        },
        {
          name: 'address',
        },
      ],
    };
    const generalConfig: GeneralConfig = { thingConfigs: { Image: imageConfig } };

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

    const result = createUploadThingFilesMutationResolver(
      imageConfig,
      generalConfig,
      serversideConfig,
    );

    expect(typeof result).toBe('function');
  });
});
