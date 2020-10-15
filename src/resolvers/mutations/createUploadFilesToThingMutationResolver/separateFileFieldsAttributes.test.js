// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../../flowTypes';

import separateFileFieldsAttributes from './separateFileFieldsAttributes';

describe('separateFileFieldsAttributes', () => {
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
  const exampleConfig: ThingConfig = {};
  Object.assign(exampleConfig, {
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
