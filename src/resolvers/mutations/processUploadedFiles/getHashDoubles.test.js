// @flow
/* eslint-env jest */
import type { EntityConfig, UploadOptions } from '../../../flowTypes';

import getHashDoubles from './getHashDoubles';

describe('getHashDoubles', () => {
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
