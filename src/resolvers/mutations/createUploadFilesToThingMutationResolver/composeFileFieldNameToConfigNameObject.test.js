// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../../flowTypes';

import composeFileFieldNameToConfigNameObject from './composeFileFieldNameToConfigNameObject';

describe('composeFileFieldNameToConfigNameObject', () => {
  test('should return wrapped object', () => {
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
    const photoConfig: ThingConfig = {
      name: 'Photo',
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
      logo: 'Image',
      header: 'Image',
      pictures: 'Image',
      photos: 'Photo',
    };

    expect(result).toEqual(expectedResult);
  });
});
