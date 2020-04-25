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
        name: 'desktop',
      },
      {
        name: 'tablet',
      },
      {
        name: 'mobile',
      },
      {
        name: 'alt',
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
        name: 'desktop',
      },
      {
        name: 'tablet',
      },
      {
        name: 'mobile',
      },
      {
        name: 'alt',
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
  const date = new Date('2020-02-25 11:34:35');
  const filesAttributes = [
    {
      _id: '1',
      hash: 'pic1',
      filename: 'pic1.png',
      mimetype: 'image/png',
      encoding: '7bit',
      uploadedAt: date,
    },
    {
      _id: '2',
      hash: 'pic2',
      filename: 'pic2.png',
      mimetype: 'image/png',
      encoding: '7bit',
      uploadedAt: date,
    },
    {
      _id: '3',
      hash: 'photo1',
      filename: 'photo1.jpg',
      mimetype: 'image/jpeg',
      encoding: '7bit',
      uploadedAt: date,
    },
    {
      _id: '4',
      hash: 'photo2',
      filename: 'photo2.jpg',
      mimetype: 'image/jpeg',
      encoding: '7bit',
      uploadedAt: date,
    },
    {
      _id: '5',
      hash: 'photo3',
      filename: 'photo3.jpg',
      mimetype: 'image/jpeg',
      encoding: '7bit',
      uploadedAt: date,
    },
    {
      _id: '6',
      hash: 'pic3',
      filename: 'pic3.png',
      mimetype: 'image/png',
      encoding: '7bit',
      uploadedAt: date,
    },
    {
      _id: '7',
      hash: 'pic4',
      filename: 'pic4.png',
      mimetype: 'image/png',
      encoding: '7bit',
      uploadedAt: date,
    },
  ];

  const options = {
    targets: ['logo', 'header', 'photos', 'pictures'],
    counts: [1, 1, 3, 2],
    hashes: ['pic1', 'pic2', 'photo1', 'photo2', 'photo3', 'pic3', 'pic4'],
  };
  const composeFileFieldsData = {
    Image: ({ hash, filename, _id, uploadedAt }) => {
      const month = uploadedAt.getMonth() + 1;
      const month2 = month < 10 ? `0${month}` : month.toFixed();
      const year = uploadedAt.getFullYear();
      return {
        fileId: _id,
        desktop: `/images/${year}_${month2}/${hash}_desktop.${filename.slice(-3)}`,
        tablet: `/images/${year}_${month2}/${hash}_tablet.${filename.slice(-3)}`,
        mobile: `/images/${year}_${month2}/${hash}_mobile.${filename.slice(-3)}`,
      };
    },
    Photo: ({ hash, filename, _id, uploadedAt }) => {
      const month = uploadedAt.getMonth() + 1;
      const month2 = month < 10 ? `0${month}` : month.toFixed();
      const year = uploadedAt.getFullYear();
      return {
        fileId: _id,
        desktop: `/photos/${year}_${month2}/${hash}_desktop.${filename.slice(-3)}`,
        tablet: `/photos/${year}_${month2}/${hash}_tablet.${filename.slice(-3)}`,
        mobile: `/photos/${year}_${month2}/${hash}_mobile.${filename.slice(-3)}`,
      };
    },
  };

  test('should return array of FilesAttributes', () => {
    const data = undefined;

    const result = composeAllFilesFieldsData(
      filesAttributes,
      data,
      options,
      thingConfig,
      composeFileFieldsData,
    );

    const expectedResult = [
      {
        fileId: '1',
        desktop: '/images/2020_02/pic1_desktop.png',
        tablet: '/images/2020_02/pic1_tablet.png',
        mobile: '/images/2020_02/pic1_mobile.png',
      },
      {
        fileId: '2',
        desktop: '/images/2020_02/pic2_desktop.png',
        tablet: '/images/2020_02/pic2_tablet.png',
        mobile: '/images/2020_02/pic2_mobile.png',
      },
      {
        fileId: '3',
        desktop: '/photos/2020_02/photo1_desktop.jpg',
        tablet: '/photos/2020_02/photo1_tablet.jpg',
        mobile: '/photos/2020_02/photo1_mobile.jpg',
      },
      {
        fileId: '4',
        desktop: '/photos/2020_02/photo2_desktop.jpg',
        tablet: '/photos/2020_02/photo2_tablet.jpg',
        mobile: '/photos/2020_02/photo2_mobile.jpg',
      },
      {
        fileId: '5',
        desktop: '/photos/2020_02/photo3_desktop.jpg',
        tablet: '/photos/2020_02/photo3_tablet.jpg',
        mobile: '/photos/2020_02/photo3_mobile.jpg',
      },
      {
        fileId: '6',
        desktop: '/images/2020_02/pic3_desktop.png',
        tablet: '/images/2020_02/pic3_tablet.png',
        mobile: '/images/2020_02/pic3_mobile.png',
      },
      {
        fileId: '7',
        desktop: '/images/2020_02/pic4_desktop.png',
        tablet: '/images/2020_02/pic4_tablet.png',
        mobile: '/images/2020_02/pic4_mobile.png',
      },
    ];

    expect(result).toEqual(expectedResult);
  });

  test('should return array of FilesAttributes with data', () => {
    const data = {
      logo: { alt: 'logo-pic1' },
      header: { alt: 'header-pic2' },
      photos: [{ alt: 'photo1' }, { alt: 'photo2' }, { alt: 'photo3' }],
      pictures: [{ alt: 'pic3' }, { alt: 'pic4' }],
    };

    const result = composeAllFilesFieldsData(
      filesAttributes,
      data,
      options,
      thingConfig,
      composeFileFieldsData,
    );

    const expectedResult = [
      {
        fileId: '1',
        desktop: '/images/2020_02/pic1_desktop.png',
        tablet: '/images/2020_02/pic1_tablet.png',
        mobile: '/images/2020_02/pic1_mobile.png',
        alt: 'logo-pic1',
      },
      {
        fileId: '2',
        desktop: '/images/2020_02/pic2_desktop.png',
        tablet: '/images/2020_02/pic2_tablet.png',
        mobile: '/images/2020_02/pic2_mobile.png',
        alt: 'header-pic2',
      },
      {
        fileId: '3',
        desktop: '/photos/2020_02/photo1_desktop.jpg',
        tablet: '/photos/2020_02/photo1_tablet.jpg',
        mobile: '/photos/2020_02/photo1_mobile.jpg',
        alt: 'photo1',
      },
      {
        fileId: '4',
        desktop: '/photos/2020_02/photo2_desktop.jpg',
        tablet: '/photos/2020_02/photo2_tablet.jpg',
        mobile: '/photos/2020_02/photo2_mobile.jpg',
        alt: 'photo2',
      },
      {
        fileId: '5',
        desktop: '/photos/2020_02/photo3_desktop.jpg',
        tablet: '/photos/2020_02/photo3_tablet.jpg',
        mobile: '/photos/2020_02/photo3_mobile.jpg',
        alt: 'photo3',
      },
      {
        fileId: '6',
        desktop: '/images/2020_02/pic3_desktop.png',
        tablet: '/images/2020_02/pic3_tablet.png',
        mobile: '/images/2020_02/pic3_mobile.png',
        alt: 'pic3',
      },
      {
        fileId: '7',
        desktop: '/images/2020_02/pic4_desktop.png',
        tablet: '/images/2020_02/pic4_tablet.png',
        mobile: '/images/2020_02/pic4_mobile.png',
        alt: 'pic4',
      },
    ];

    expect(result).toEqual(expectedResult);
  });
});
