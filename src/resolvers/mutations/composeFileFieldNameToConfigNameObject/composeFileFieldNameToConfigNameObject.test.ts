/* eslint-env jest */
import type { EntityConfig } from '../../../tsTypes';

import composeFileFieldNameToConfigNameObject from './index';

describe('composeFileFieldNameToConfigNameObject', () => {
  test('should return wrapped object', () => {
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
    const photoConfig: EntityConfig = {
      name: 'Photo',
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
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
          type: 'fileFields',
        },
        {
          name: 'header',
          config: imageConfig,
          type: 'fileFields',
        },
        {
          name: 'pictures',
          config: imageConfig,
          array: true,
          type: 'fileFields',
        },
        {
          name: 'photos',
          config: photoConfig,
          array: true,
          type: 'fileFields',
        },
      ],
    };

    const result = composeFileFieldNameToConfigNameObject(entityConfig);

    const expectedResult = {
      logo: { configName: 'Image' },
      header: { configName: 'Image' },
      pictures: { configName: 'Image', array: true },
      photos: { configName: 'Photo', array: true },
    };

    expect(result).toEqual(expectedResult);
  });
});
