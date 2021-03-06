// @flow
/* eslint-env jest */
import type { ThingConfig, UploadOptions } from '../../../flowTypes';

import getHashDoubles from './getHashDoubles';

describe('getHashDoubles', () => {
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

  test('should return empty array of doubles', () => {
    const options: UploadOptions = {
      targets: ['logo', 'header', 'photos', 'pictures'],
      counts: [1, 1, 3, 2],
      hashes: ['pic1', 'pic2', 'photo1', 'photo2', 'photo3', 'pic3', 'pic4'],
    };

    const result = getHashDoubles(options, thingConfig);

    const expectedResult = [null, null, null, null, null, null, null];

    expect(result).toEqual(expectedResult);
  });

  test('should return empty of doubles', () => {
    const options: UploadOptions = {
      targets: ['logo', 'header', 'photos', 'pictures'],
      counts: [1, 1, 3, 2],
      hashes: ['pic1', 'pic1', 'pic1', 'photo2', 'pic1', 'pic3', 'pic1'],
    };

    const result = getHashDoubles(options, thingConfig);

    const expectedResult = [null, 0, null, null, 2, null, 0];

    expect(result).toEqual(expectedResult);
  });
});
