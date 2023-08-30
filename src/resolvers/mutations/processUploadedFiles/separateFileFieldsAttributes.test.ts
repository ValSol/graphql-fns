/* eslint-env jest */
import type { EntityConfig } from '../../../tsTypes';

import separateFileFieldsAttributes from './separateFileFieldsAttributes';

describe('separateFileFieldsAttributes', () => {
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
  const exampleConfig = {} as EntityConfig;
  Object.assign(exampleConfig, {
    name: 'Example',
    type: 'tangible',
    fileFields: [
      {
        name: 'logo',
        config: imageConfig,
        type: 'fileFields',
        variants: ['plain'],
      },
      {
        name: 'header',
        config: imageConfig,
        type: 'fileFields',
        variants: ['plain'],
      },
      {
        name: 'pictures',
        config: imageConfig,
        array: true,
        type: 'fileFields',
        variants: ['plain'],
      },
      {
        name: 'photos',
        config: photoConfig,
        array: true,
        type: 'fileFields',
        variants: ['plain'],
      },
    ],
  });

  test('should return wrapped object', () => {
    const options = {
      targets: ['logo', 'header', 'photos', 'pictures'],
      counts: [1, 1, 3, 2],
      hashes: ['pic1', 'pic2', 'photo1', 'photo2', 'photo3', 'pic3', 'pic4'],
    };

    const result = separateFileFieldsAttributes(options, exampleConfig);

    const expectedResult = new Map();
    expectedResult.set(imageConfig, [0, 1, 5, 6]);
    expectedResult.set(photoConfig, [2, 3, 4]);

    expect(result).toEqual(expectedResult);
  });
});
