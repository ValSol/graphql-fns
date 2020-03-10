// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../../flowTypes';

import composeAllFilesFieldsData from './composeAllFilesFieldsData';

describe('composeAllFilesFieldsData', () => {
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

  test('should return array of FilesAttributes', () => {
    const filesAttributes = [
      {
        _id: '1',
        hash: 'pic1',
        filename: 'pic1.png',
        mimetype: 'image/png',
        encoding: '7bit',
      },
      {
        _id: '2',
        hash: 'pic2',
        filename: 'pic2.png',
        mimetype: 'image/png',
        encoding: '7bit',
      },
      {
        _id: '3',
        hash: 'photo1',
        filename: 'photo1.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
      },
      {
        _id: '4',
        hash: 'photo2',
        filename: 'photo2.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
      },
      {
        _id: '5',
        hash: 'photo3',
        filename: 'photo3.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
      },
      {
        _id: '6',
        hash: 'pic3',
        filename: 'pic3.png',
        mimetype: 'image/png',
        encoding: '7bit',
      },
      {
        _id: '7',
        hash: 'pic4',
        filename: 'pic4.png',
        mimetype: 'image/png',
        encoding: '7bit',
      },
    ];

    const options = {
      targets: ['logo', 'header', 'photos', 'pictures'],
      counts: [1, 1, 3, 2],
    };

    const composeFileFieldsData = {
      Image: ({ hash, filename, _id }) => ({
        fileId: _id,
        desktop: `${hash}-desktop.${filename.slice(-3)}`,
        tablet: `${hash}-tablet.${filename.slice(-3)}`,
        mobile: `${hash}-mobile.${filename.slice(-3)}`,
      }),
      Photo: ({ hash, filename, _id }) => ({
        fileId: _id,
        desktop: `${hash}-desktop.${filename.slice(-3)}`,
        tablet: `${hash}-tablet.${filename.slice(-3)}`,
        mobile: `${hash}-mobile.${filename.slice(-3)}`,
      }),
    };

    const expectedResult = [
      {
        fileId: '1',
        desktop: 'pic1-desktop.png',
        tablet: 'pic1-tablet.png',
        mobile: 'pic1-mobile.png',
      },
      {
        fileId: '2',
        desktop: 'pic2-desktop.png',
        tablet: 'pic2-tablet.png',
        mobile: 'pic2-mobile.png',
      },
      {
        fileId: '3',
        desktop: 'photo1-desktop.jpg',
        tablet: 'photo1-tablet.jpg',
        mobile: 'photo1-mobile.jpg',
      },
      {
        fileId: '4',
        desktop: 'photo2-desktop.jpg',
        tablet: 'photo2-tablet.jpg',
        mobile: 'photo2-mobile.jpg',
      },
      {
        fileId: '5',
        desktop: 'photo3-desktop.jpg',
        tablet: 'photo3-tablet.jpg',
        mobile: 'photo3-mobile.jpg',
      },
      {
        fileId: '6',
        desktop: 'pic3-desktop.png',
        tablet: 'pic3-tablet.png',
        mobile: 'pic3-mobile.png',
      },
      {
        fileId: '7',
        desktop: 'pic4-desktop.png',
        tablet: 'pic4-tablet.png',
        mobile: 'pic4-mobile.png',
      },
    ];

    const result = composeAllFilesFieldsData(
      filesAttributes,
      new Date(),
      options,
      thingConfig,
      composeFileFieldsData,
    );

    expect(result).toEqual(expectedResult);
  });
});
