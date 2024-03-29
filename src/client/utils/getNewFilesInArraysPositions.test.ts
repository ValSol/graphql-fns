/* eslint-env jest */

import type { EntityConfig } from '../../tsTypes';

import getHashFromValue from './getHashFromValue';
import getNewFilesInArraysPositions from './getNewFilesInArraysPositions';

describe('getNewFilesInArraysPositions util', () => {
  test('should return new files index list', () => {
    const imageConfig: EntityConfig = {
      name: 'Image',
      type: 'file',
      textFields: [
        {
          name: 'fileId',
          type: 'textFields',
        },
        {
          name: 'desktop',
          type: 'textFields',
        },
        {
          name: 'tablet',
          type: 'textFields',
        },
        {
          name: 'mobile',
          type: 'textFields',
        },
      ],
    };
    const exampleConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
          type: 'fileFields',
        },
        {
          name: 'header',
          config: imageConfig,
          type: 'fileFields',
        },
        {
          name: 'hero',
          config: imageConfig,
          type: 'fileFields',
        },
        {
          name: 'photos',
          config: imageConfig,
          array: true,
          type: 'fileFields',
          variants: ['plain'],
        },
        {
          name: 'avatars',
          config: imageConfig,
          array: true,
          type: 'fileFields',
          variants: ['plain'],
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
      hero: { desktop: 'blob://abc#hero' },
      header: { desktop: 'blob://abc#header' },
      photos,
    };

    const hashes = ['hero', 'header', 'pic1', 'pic2', 'pic3', 'pic4', 'pic5', 'logo'];

    const uploadArgs = {
      files: [
        { desktop: 'blob://abc#hero' },
        { desktop: 'blob://abc#header' },
        { desktop: 'blob://abc#pic1' },
        { desktop: 'blob://abc#pic2' },
        { desktop: 'blob://abc#pic3' },
        { desktop: 'blob://abc#pic4' },
        { desktop: 'blob://abc#pic5' },
        { desktop: 'blob://abc#logo' },
      ],
      options: {
        targets: ['hero', 'header', 'photos', 'logo'],
        counts: [1, 1, 5, 1],
        hashes,
      },
    };

    const expectedResult = { photos: [4, 0, 8, 12, 5] };
    const result = getNewFilesInArraysPositions(
      values,
      uploadArgs,
      getHashFromValue,
      exampleConfig,
    );
    expect(result).toEqual(expectedResult);
  });

  test('should return new files index list with duplicateFiles', () => {
    const imageConfig: EntityConfig = {
      name: 'Image',
      type: 'file',
      textFields: [
        {
          name: 'fileId',
          type: 'textFields',
        },
        {
          name: 'desktop',
          type: 'textFields',
        },
        {
          name: 'tablet',
          type: 'textFields',
        },
        {
          name: 'mobile',
          type: 'textFields',
        },
      ],
    };
    const exampleConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
          type: 'fileFields',
        },
        {
          name: 'header',
          config: imageConfig,
          type: 'fileFields',
        },
        {
          name: 'hero',
          config: imageConfig,
          type: 'fileFields',
        },
        {
          name: 'photos',
          config: imageConfig,
          array: true,
          type: 'fileFields',
          variants: ['plain'],
        },
        {
          name: 'avatars',
          config: imageConfig,
          array: true,
          type: 'fileFields',
          variants: ['plain'],
        },
      ],
    };

    const photos = [
      { desktop: 'blob://abc#pic2' }, // 0
      { desktop: 'http://path1' }, // 1
      { desktop: 'http://path2' }, // 2
      { desktop: 'http://path3' }, // 3
      { desktop: 'blob://abc#pic-double' }, // 4
      { desktop: 'blob://abc#pic-double' }, // 5
      { desktop: 'http://path4' }, // 6
      { desktop: 'http://path5' }, // 7
      { desktop: 'blob://abc#pic-double' }, // 8
      { desktop: 'http://path6' }, // 9
      { desktop: 'http://path7' }, // 10
      { desktop: 'http://path8' }, // 11
      { desktop: 'blob://abc#pic4' }, // 12
    ];

    const values = {
      title: 'Short Name',
      avatars: [{ desktop: 'http://avatar1' }, { desktop: 'http://avatar2' }],
      logo: { desktop: 'blob://abc#logo' },
      hero: { desktop: 'blob://abc#hero' },
      header: { desktop: 'blob://abc#header' },
      photos,
    };

    const hashes = [
      'hero',
      'header',
      'pic-double',
      'pic2',
      'pic-double',
      'pic4',
      'pic-double',
      'logo',
    ];

    const uploadArgs = {
      files: [
        { desktop: 'blob://abc#hero' },
        { desktop: 'blob://abc#header' },
        { desktop: 'blob://abc#pic-double' },
        { desktop: 'blob://abc#pic2' },
        { desktop: 'blob://abc#pic-double' },
        { desktop: 'blob://abc#pic4' },
        { desktop: 'blob://abc#pic-double' },
        { desktop: 'blob://abc#logo' },
      ],
      options: {
        targets: ['hero', 'header', 'photos', 'logo'],
        counts: [1, 1, 5, 1],
        hashes,
      },
    };

    const expectedResult = { photos: [4, 0, 5, 12, 8] };
    const result = getNewFilesInArraysPositions(
      values,
      uploadArgs,
      getHashFromValue,
      exampleConfig,
    );
    expect(result).toEqual(expectedResult);
  });
});
