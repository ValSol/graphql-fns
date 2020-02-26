// @flow
/* eslint-env jest */
import type { GeneralConfig, ThingConfig } from '../../flowTypes';

import createUploadManyFilesToThingMutationResolver from './createUploadManyFilesToThingMutationResolver';

describe('createUploadManyFilesToThingMutationResolver', () => {
  const generalConfig: GeneralConfig = { thingConfigs: [] };
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
      saveFiles: async () => ({
        pictures: [
          {
            fileId: '111',
            address: '/image/pic1',
          },
          {
            fileId: '222',
            address: '/image/pic2',
          },
        ],
      }),
    };

    const result = createUploadManyFilesToThingMutationResolver(
      exampleConfig,
      generalConfig,
      serversideConfig,
    );

    expect(typeof result).toBe('function');
  });
});
