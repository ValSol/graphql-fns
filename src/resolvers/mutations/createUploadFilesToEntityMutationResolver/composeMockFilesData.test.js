// @flow
/* eslint-env jest */
import type { EntityConfig } from '../../../flowTypes';

import composeMockFilesData from './composeMockFilesData';

describe('composeMockFilesData', () => {
  const imageConfig: EntityConfig = {
    name: 'Image',
    type: 'file',
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
  const photoConfig: EntityConfig = {
    name: 'Photo',
    type: 'file',
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

  const date = new Date('2020-02-25 11:34:35');

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

  const files = [
    {
      filename: 'pic1.jpg',
      mimetype: 'image/png',
      encoding: '7bit',
    },
    {
      filename: 'pic2.jpg',
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
      filename: 'pic3.jpg',
      mimetype: 'image/png',
      encoding: '7bit',
    },
    {
      filename: 'pic4.jpg',
      mimetype: 'image/png',
      encoding: '7bit',
    },
  ];

  const options = {
    targets: ['logo', 'header', 'photos', 'pictures'],
    counts: [1, 1, 3, 2],
    hashes: ['pic1', 'pic2', 'photo1', 'photo2', 'photo3', 'pic3', 'pic4'],
  };

  test('should return array of FilesAttributes', () => {
    const data = {};
    const result = composeMockFilesData(
      options,
      data,
      files,
      entityConfig,
      composeFileFieldsData,
      date,
    );

    const expectedResult = {
      header: {
        desktop: '/images/2020_02/pic2_desktop.jpg',
        fileId: '1',
        mobile: '/images/2020_02/pic2_mobile.jpg',
        tablet: '/images/2020_02/pic2_tablet.jpg',
      },
      logo: {
        desktop: '/images/2020_02/pic1_desktop.jpg',
        fileId: '0',
        mobile: '/images/2020_02/pic1_mobile.jpg',
        tablet: '/images/2020_02/pic1_tablet.jpg',
      },
      photos: [
        {
          desktop: '/photos/2020_02/photo1_desktop.jpg',
          fileId: '2',
          mobile: '/photos/2020_02/photo1_mobile.jpg',
          tablet: '/photos/2020_02/photo1_tablet.jpg',
        },
        {
          desktop: '/photos/2020_02/photo2_desktop.jpg',
          fileId: '3',
          mobile: '/photos/2020_02/photo2_mobile.jpg',
          tablet: '/photos/2020_02/photo2_tablet.jpg',
        },
        {
          desktop: '/photos/2020_02/photo3_desktop.jpg',
          fileId: '4',
          mobile: '/photos/2020_02/photo3_mobile.jpg',
          tablet: '/photos/2020_02/photo3_tablet.jpg',
        },
      ],
      pictures: [
        {
          desktop: '/images/2020_02/pic3_desktop.jpg',
          fileId: '5',
          mobile: '/images/2020_02/pic3_mobile.jpg',
          tablet: '/images/2020_02/pic3_tablet.jpg',
        },
        {
          desktop: '/images/2020_02/pic4_desktop.jpg',
          fileId: '6',
          mobile: '/images/2020_02/pic4_mobile.jpg',
          tablet: '/images/2020_02/pic4_tablet.jpg',
        },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return array of FilesAttributes', () => {
    const data = {
      logo: { alt: 'logo-pic1' },
      header: { alt: 'header-pic2' },
      photos: [{ alt: 'photo1' }, { alt: 'photo2' }, { alt: 'photo3' }],
      pictures: [{ alt: 'pic3' }, { alt: 'pic4' }],
    };
    const result = composeMockFilesData(
      options,
      data,
      files,
      entityConfig,
      composeFileFieldsData,
      date,
    );

    const expectedResult = {
      header: {
        desktop: '/images/2020_02/pic2_desktop.jpg',
        fileId: '1',
        mobile: '/images/2020_02/pic2_mobile.jpg',
        tablet: '/images/2020_02/pic2_tablet.jpg',
        alt: 'header-pic2',
      },
      logo: {
        desktop: '/images/2020_02/pic1_desktop.jpg',
        fileId: '0',
        mobile: '/images/2020_02/pic1_mobile.jpg',
        tablet: '/images/2020_02/pic1_tablet.jpg',
        alt: 'logo-pic1',
      },
      photos: [
        {
          desktop: '/photos/2020_02/photo1_desktop.jpg',
          fileId: '2',
          mobile: '/photos/2020_02/photo1_mobile.jpg',
          tablet: '/photos/2020_02/photo1_tablet.jpg',
          alt: 'photo1',
        },
        {
          desktop: '/photos/2020_02/photo2_desktop.jpg',
          fileId: '3',
          mobile: '/photos/2020_02/photo2_mobile.jpg',
          tablet: '/photos/2020_02/photo2_tablet.jpg',
          alt: 'photo2',
        },
        {
          desktop: '/photos/2020_02/photo3_desktop.jpg',
          fileId: '4',
          mobile: '/photos/2020_02/photo3_mobile.jpg',
          tablet: '/photos/2020_02/photo3_tablet.jpg',
          alt: 'photo3',
        },
      ],
      pictures: [
        {
          desktop: '/images/2020_02/pic3_desktop.jpg',
          fileId: '5',
          mobile: '/images/2020_02/pic3_mobile.jpg',
          tablet: '/images/2020_02/pic3_tablet.jpg',
          alt: 'pic3',
        },
        {
          desktop: '/images/2020_02/pic4_desktop.jpg',
          fileId: '6',
          mobile: '/images/2020_02/pic4_mobile.jpg',
          tablet: '/images/2020_02/pic4_tablet.jpg',
          alt: 'pic4',
        },
      ],
    };

    expect(result).toEqual(expectedResult);
  });
});
