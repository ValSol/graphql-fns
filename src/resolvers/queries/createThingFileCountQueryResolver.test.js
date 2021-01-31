// @flow
/* eslint-env jest */
import type { GeneralConfig, ThingConfig } from '../../flowTypes';

import createThingFileCountQueryResolver from './createThingFileCountQueryResolver';

describe('createThingFileCountQueryResolver', () => {
  const generalConfig: GeneralConfig = { thingConfigs: {} };
  test('should create mutation add thing type', () => {
    const imageConfig: ThingConfig = {
      name: 'Image',
      file: true,
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
    const result = createThingFileCountQueryResolver(imageConfig, generalConfig, serversideConfig);

    expect(typeof result).toBe('function');
  });
});
