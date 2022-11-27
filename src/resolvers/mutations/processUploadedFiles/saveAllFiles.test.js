// @flow
/* eslint-env jest */
import type { EntityConfig } from '../../../flowTypes';

import saveAllFiles from './saveAllFiles';

describe('saveAllFiles', () => {
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
    Image: async ({ filename, mimetype, encoding }, hash, uploadedAt) => ({
      filename,
      mimetype,
      encoding,
      hash,
      uploadedAt,
    }),
    Photo: async ({ filename, mimetype, encoding }, hash, uploadedAt) => ({
      filename,
      mimetype,
      encoding,
      hash,
      uploadedAt,
    }),
  };

  test('should return array of FilesAttributes', async () => {
    const alreadyCreatedFiles = [null, null, null, null, null, null, null];
    const uploadedAt = new Date('2020-03-25 11:34:35');
    const expectedResult = [
      {
        hash: 'pic1',
        filename: 'pic1.png',
        mimetype: 'image/png',
        encoding: '7bit',
        uploadedAt,
      },
      {
        hash: 'pic2',
        filename: 'pic2.png',
        mimetype: 'image/png',
        encoding: '7bit',
        uploadedAt,
      },
      {
        hash: 'photo1',
        filename: 'photo1.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
        uploadedAt,
      },
      {
        hash: 'photo2',
        filename: 'photo2.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
        uploadedAt,
      },
      {
        hash: 'photo3',
        filename: 'photo3.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
        uploadedAt,
      },
      {
        hash: 'pic3',
        filename: 'pic3.png',
        mimetype: 'image/png',
        encoding: '7bit',
        uploadedAt,
      },
      {
        hash: 'pic4',
        filename: 'pic4.png',
        mimetype: 'image/png',
        encoding: '7bit',
        uploadedAt,
      },
    ];
    const result = await saveAllFiles(
      filesUploaded,
      alreadyCreatedFiles,
      uploadedAt,
      options,
      entityConfig,
      saveFiles,
    );

    expect(result).toEqual(expectedResult);
  });

  test('should return array of FilesAttributes 2', async () => {
    const uploadedAt = new Date('2020-03-25 11:34:35');
    const alreadyCreatedFiles = [
      null,
      {
        _id: '1',
        hash: 'pic2',
        filename: 'pic2.png',
        mimetype: 'image/png',
        encoding: '7bit',
        uploadedAt,
      },
      null,
      {
        _id: '2',
        hash: 'photo2',
        filename: 'photo2.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
        uploadedAt,
      },
      {
        _id: '3',
        hash: 'photo3',
        filename: 'photo3.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
        uploadedAt,
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
        uploadedAt,
      },
      null,
      {
        hash: 'photo1',
        filename: 'photo1.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
        uploadedAt,
      },
      null,
      null,
      {
        hash: 'pic3',
        filename: 'pic3.png',
        mimetype: 'image/png',
        encoding: '7bit',
        uploadedAt,
      },
      {
        hash: 'pic4',
        filename: 'pic4.png',
        mimetype: 'image/png',
        encoding: '7bit',
        uploadedAt,
      },
    ];
    const result = await saveAllFiles(
      filesUploaded,
      alreadyCreatedFiles,
      uploadedAt,
      options,
      entityConfig,
      saveFiles,
    );

    expect(result).toEqual(expectedResult);
  });
});
