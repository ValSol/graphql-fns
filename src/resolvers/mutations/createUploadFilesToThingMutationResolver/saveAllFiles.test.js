// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../../flowTypes';

import saveAllFiles from './saveAllFiles';

describe('saveAllFiles', () => {
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

  const filesUploaded = [
    {
      filename: 'pic1.png',
      mimetype: 'image/png',
      encoding: '7bit',
    },
    {
      filename: 'pic2.png',
      mimetype: 'image/png',
      encoding: '7bit',
    },
    {
      filename: 'photo1.jpg',
      mimetype: 'image/jpeg',
      encoding: '7bit',
    },
    {
      filename: 'photo2.jpg',
      mimetype: 'image/jpeg',
      encoding: '7bit',
    },
    {
      filename: 'photo3.jpg',
      mimetype: 'image/jpeg',
      encoding: '7bit',
    },
    {
      filename: 'pic3.png',
      mimetype: 'image/png',
      encoding: '7bit',
    },
    {
      filename: 'pic4.png',
      mimetype: 'image/png',
      encoding: '7bit',
    },
  ];

  const options = {
    targets: ['logo', 'header', 'photos', 'pictures'],
    counts: [1, 1, 3, 2],
    hashes: ['pic1', 'pic2', 'photo1', 'photo2', 'photo3', 'pic3', 'pic4'],
  };

  const saveFiles = {
    Image: async ({ filename, mimetype, encoding }, hash) => ({
      filename,
      mimetype,
      encoding,
      hash,
    }),
    Photo: async ({ filename, mimetype, encoding }, hash) => ({
      filename,
      mimetype,
      encoding,
      hash,
    }),
  };

  test('should return array of FilesAttributes', async () => {
    const alreadyCreatedFiles = [null, null, null, null, null, null, null];
    const expectedResult = [
      {
        hash: 'pic1',
        filename: 'pic1.png',
        mimetype: 'image/png',
        encoding: '7bit',
      },
      {
        hash: 'pic2',
        filename: 'pic2.png',
        mimetype: 'image/png',
        encoding: '7bit',
      },
      {
        hash: 'photo1',
        filename: 'photo1.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
      },
      {
        hash: 'photo2',
        filename: 'photo2.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
      },
      {
        hash: 'photo3',
        filename: 'photo3.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
      },
      {
        hash: 'pic3',
        filename: 'pic3.png',
        mimetype: 'image/png',
        encoding: '7bit',
      },
      {
        hash: 'pic4',
        filename: 'pic4.png',
        mimetype: 'image/png',
        encoding: '7bit',
      },
    ];
    const result = await saveAllFiles(
      filesUploaded,
      alreadyCreatedFiles,
      new Date(),
      options,
      thingConfig,
      saveFiles,
    );

    expect(result).toEqual(expectedResult);
  });

  test('should return array of FilesAttributes 2', async () => {
    const alreadyCreatedFiles = [
      null,
      {
        _id: '1',
        hash: 'pic2',
        filename: 'pic2.png',
        mimetype: 'image/png',
        encoding: '7bit',
      },
      null,
      {
        _id: '2',
        hash: 'photo2',
        filename: 'photo2.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
      },
      {
        _id: '3',
        hash: 'photo3',
        filename: 'photo3.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
      },
      null,
      null,
    ];
    const expectedResult = [
      {
        hash: 'pic1',
        filename: 'pic1.png',
        mimetype: 'image/png',
        encoding: '7bit',
      },
      null,
      {
        hash: 'photo1',
        filename: 'photo1.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
      },
      null,
      null,
      {
        hash: 'pic3',
        filename: 'pic3.png',
        mimetype: 'image/png',
        encoding: '7bit',
      },
      {
        hash: 'pic4',
        filename: 'pic4.png',
        mimetype: 'image/png',
        encoding: '7bit',
      },
    ];
    const result = await saveAllFiles(
      filesUploaded,
      alreadyCreatedFiles,
      new Date(),
      options,
      thingConfig,
      saveFiles,
    );

    expect(result).toEqual(expectedResult);
  });
});
