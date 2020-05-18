// @flow
/* eslint-env jest */
import type { GeneralConfig, ThingConfig } from '../../../flowTypes';

import createUploadFilesToThingMutationResolver from './index';

describe('createUploadFilesToThingMutationResolver', () => {
  const generalConfig: GeneralConfig = { thingConfigs: {} };
  test('should create mutation add thing type', () => {
    const imageConfig: ThingConfig = {
      name: 'Image',
      embedded: true,
      textFields: [
        {
          name: 'fileId',
        },
        {
          name: 'address',
        },
      ],
    };
    const exampleConfig: ThingConfig = {};
    Object.assign(exampleConfig, {
      name: 'Example',
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

    const result = createUploadFilesToThingMutationResolver(
      exampleConfig,
      generalConfig,
      serversideConfig,
    );

    expect(typeof result).toBe('function');
  });
});
