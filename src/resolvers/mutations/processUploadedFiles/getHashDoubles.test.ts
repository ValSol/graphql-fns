/* eslint-env jest */
import type { EntityConfig, UploadOptions } from '../../../tsTypes';

import getHashDoubles from './getHashDoubles';

describe('getHashDoubles', () => {
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
  };

  test('should return empty array of doubles', () => {
    const options: UploadOptions = {
      targets: ['logo', 'header', 'photos', 'pictures'],
      counts: [1, 1, 3, 2],
      hashes: ['pic1', 'pic2', 'photo1', 'photo2', 'photo3', 'pic3', 'pic4'],
    };

    const result = getHashDoubles(options, entityConfig);

    const expectedResult = [null, null, null, null, null, null, null];

    expect(result).toEqual(expectedResult);
  });

  test('should return empty of doubles', () => {
    const options: UploadOptions = {
      targets: ['logo', 'header', 'photos', 'pictures'],
      counts: [1, 1, 3, 2],
      hashes: ['pic1', 'pic1', 'pic1', 'photo2', 'pic1', 'pic3', 'pic1'],
    };

    const result = getHashDoubles(options, entityConfig);

    const expectedResult = [null, 0, null, null, 2, null, 0];

    expect(result).toEqual(expectedResult);
  });
});
