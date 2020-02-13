// @flow
/* eslint-env jest */
import type { GeneralConfig, ThingConfig } from '../../flowTypes';

import createUploadFileToThingMutationResolver from './createUploadFileToThingMutationResolver';

describe('createUploadFileToThingMutationResolver', () => {
  const generalConfig: GeneralConfig = { thingConfigs: [] };
  test('should create mutation add thing type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      fileFields: [
        {
          name: 'fileField',
          generalName: 'generalFile',
          fileType: 'fileType',
        },
        {
          name: 'fileFieldTablet',
          generalName: 'generalFile',
          fileType: 'fileType',
        },
        {
          name: 'fileFieldMobile',
          generalName: 'generalFile',
          fileType: 'fileType',
        },
      ],
    };

    const serversideConfig = {
      saveFiles: async () => ({
        fileField: '/test',
        fileFieldMobile: '/test_mobile',
        fileFieldTablet: '/test_tablet',
      }),
    };
    const result = createUploadFileToThingMutationResolver(
      thingConfig,
      generalConfig,
      serversideConfig,
    );

    expect(typeof result).toBe('function');
  });
});
