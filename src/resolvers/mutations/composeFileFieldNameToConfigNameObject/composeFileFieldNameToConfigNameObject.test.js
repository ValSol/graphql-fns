// @flow
/* eslint-env jest */
import type { EntityConfig } from '../../../flowTypes';

import composeFileFieldNameToConfigNameObject from './index';

describe('composeFileFieldNameToConfigNameObject', () => {
  test('should return wrapped object', () => {
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
    const photoConfig: EntityConfig = {
      name: 'Photo',
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
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
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
