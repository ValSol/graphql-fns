// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../../flowTypes';

import composeFileFieldNameToConfigNameObject from './composeFileFieldNameToConfigNameObject';

describe('composeFileFieldNameToConfigNameObject', () => {
  test('should return wrapped object', () => {
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
    const photoConfig: ThingConfig = {
      name: 'Photo',
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
    const thingConfig: ThingConfig = {
      name: 'Example',
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
        },
        {
          name: 'header',
          config: imageConfig,
        },
        {
          name: 'pictures',
          config: imageConfig,
          array: true,
        },
        {
          name: 'photos',
          config: photoConfig,
          array: true,
        },
      ],
    };

    const result = composeFileFieldNameToConfigNameObject(thingConfig);

    const expectedResult = {
      logo: { configName: 'Image' },
      header: { configName: 'Image' },
      pictures: { configName: 'Image', array: true },
      photos: { configName: 'Photo', array: true },
    };

    expect(result).toEqual(expectedResult);
  });
});
