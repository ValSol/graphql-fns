// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import updateFileFieldsAfterUpload from './updateFileFieldsAfterUpload';

describe('updateFileFieldsAfterUpload util', () => {
  test('should return rearranged uploaded fileFields', () => {
    const imageConfig: ThingConfig = {
      name: 'Image',
      file: true,
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
      ],
    };
    const exampleConfig: ThingConfig = {
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
          name: 'hero',
          config: imageConfig,
        },
        {
          name: 'photos',
          config: imageConfig,
          array: true,
        },
        {
          name: 'avatars',
          config: imageConfig,
          array: true,
        },
      ],
    };

    const photos = [
      { desktop: 'blob://abc#pic2' }, // 0
      { desktop: 'http://path1' }, // 1
      { desktop: 'http://path2' }, // 2
      { desktop: 'http://path3' }, // 3
      { desktop: 'blob://abc#pic1' }, // 4
      { desktop: 'blob://abc#pic5' }, // 5
      { desktop: 'http://path4' }, // 6
      { desktop: 'http://path5' }, // 7
      { desktop: 'blob://abc#pic3' }, // 8
      { desktop: 'http://path6' }, // 9
      { desktop: 'http://path7' }, // 10
      { desktop: 'http://path8' }, // 11
      { desktop: 'blob://abc#pic4' }, // 12
    ];

    const values = {
      title: 'Short Name',
      avatars: [{ desktop: 'http://avatar1' }, { desktop: 'http://avatar2' }],
      logo: { desktop: 'blob://abc#logo' },
      hero: { desktop: 'http://hero' },
      header: { desktop: 'blob://abc#header' },
      photos,
    };

    const uploadedPhotos = [
      { desktop: 'http://path1' },
      { desktop: 'http://path2' },
      { desktop: 'http://path4' },
      { desktop: 'http://path6' },
      { desktop: 'http://path8' },
      { desktop: 'http://path9' },
      { desktop: 'http://path10' },
      { desktop: 'http://pic1' },
      { desktop: 'http://pic2' },
      { desktop: 'http://pic3' },
      { desktop: 'http://pic4' },
      { desktop: 'http://pic5' },
    ];

    const uploadedValues = {
      logo: { desktop: 'http://logo' },
      header: { desktop: 'http://header' },
      photos: uploadedPhotos,
    };

    const newFilesInArraysPositions = { photos: [4, 0, 8, 12, 5] };

    const expectedResult = {
      arrayFileFields: {
        photos: [
          { desktop: 'http://pic2' }, // 0
          { desktop: 'http://path1' }, // 1
          { desktop: 'http://path2' }, // 2
          { desktop: 'http://path3' }, // 3
          { desktop: 'http://pic1' }, // 4
          { desktop: 'http://pic5' }, // 5
          { desktop: 'http://path4' }, // 6
          { desktop: 'http://path5' }, // 7
          { desktop: 'http://pic3' }, // 8
          { desktop: 'http://path6' }, // 9
          { desktop: 'http://path7' }, // 10
          { desktop: 'http://path8' }, // 11
          { desktop: 'http://pic4' }, // 12
        ],
      },
      scalarFileFields: {
        logo: { desktop: 'http://logo' },
        header: { desktop: 'http://header' },
      },
    };

    const result = updateFileFieldsAfterUpload(
      newFilesInArraysPositions,
      values,
      uploadedValues,
      exampleConfig,
    );
    expect(result).toEqual(expectedResult);
  });
});
