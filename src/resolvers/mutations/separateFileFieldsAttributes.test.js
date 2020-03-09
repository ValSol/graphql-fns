// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import separateFileFieldsAttributes from './separateFileFieldsAttributes';

describe('separateFileFieldsAttributes', () => {
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
    // const attributes = [
    //   {
    //     hash: 'pic1',
    //     filename: 'pic1.png',
    //     mimetype: 'image/png',
    //     encoding: '7bit',
    //   },
    //   {
    //     hash: 'pic2',
    //     filename: 'pic2.png',
    //     mimetype: 'image/png',
    //     encoding: '7bit',
    //   },
    //   {
    //     hash: 'photo1',
    //     filename: 'pic1.jpg',
    //     mimetype: 'image/jpeg',
    //     encoding: '7bit',
    //   },
    //   {
    //     hash: 'photo2',
    //     filename: 'pic2.jpg',
    //     mimetype: 'image/jpeg',
    //     encoding: '7bit',
    //   },
    //   {
    //     hash: 'photo3',
    //     filename: 'pic3.jpg',
    //     mimetype: 'image/jpeg',
    //     encoding: '7bit',
    //   },
    //   {
    //     hash: 'pic3',
    //     filename: 'pic3.png',
    //     mimetype: 'image/png',
    //     encoding: '7bit',
    //   },
    //   {
    //     hash: 'pic4',
    //     filename: 'pic4.png',
    //     mimetype: 'image/png',
    //     encoding: '7bit',
    //   },
    // ];

    const options = {
      targets: ['logo', 'header', 'photos', 'pictures'],
      counts: [1, 1, 3, 2],
    };

    const result = separateFileFieldsAttributes(options, exampleConfig);

    const expectedResult = new Map();
    expectedResult.set(imageConfig, [0, 1, 5, 6]);
    expectedResult.set(photoConfig, [2, 3, 4]);

    expect(result).toEqual(expectedResult);
  });
});
