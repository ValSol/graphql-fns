// @flow
/* eslint-env jest */

import getHashFromValue from './getHashFromValue';
import createNewFilesIndexListFromUploadArgs from './createNewFilesIndexListFromUploadArgs';

describe('createNewFilesIndexListFromUploadArgs util', () => {
  test('should return new files index list', () => {
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
      logo: { desktop: 'blob://abc#logo' },
      hero: { desktop: 'blob://abc#hero' },
      head: { desktop: 'blob://abc#head' },
      photos,
    };

    const hashes = ['hero', 'head', 'pic1', 'pic2', 'pic3', 'pic4', 'pic5', 'logo'];

    const uploadArgs = {
      files: [
        { desktop: 'blob://abc#hero' },
        { desktop: 'blob://abc#head' },
        { desktop: 'blob://abc#pic1' },
        { desktop: 'blob://abc#pic2' },
        { desktop: 'blob://abc#pic3' },
        { desktop: 'blob://abc#pic4' },
        { desktop: 'blob://abc#pic5' },
        { desktop: 'blob://abc#logo' },
      ],
      options: {
        targets: ['hero', 'head', 'photos', 'logo'],
        counts: [1, 1, 5, 1],
        hashes,
      },
    };

    const fileFieldName = 'photos';

    const expectedResult = [4, 0, 8, 12, 5];
    const result = createNewFilesIndexListFromUploadArgs(
      fileFieldName,
      values,
      uploadArgs,
      getHashFromValue,
    );
    expect(result).toEqual(expectedResult);
  });

  test('should return new files index list with duplicate files', () => {
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
      logo: { desktop: 'blob://abc#logo' },
      hero: { desktop: 'blob://abc#hero' },
      head: { desktop: 'blob://abc#head' },
      photos,
    };

    const hashes = [
      'hero',
      'head',
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
        { desktop: 'blob://abc#head' },
        { desktop: 'blob://abc#pic-double' },
        { desktop: 'blob://abc#pic2' },
        { desktop: 'blob://abc#pic-double' },
        { desktop: 'blob://abc#pic4' },
        { desktop: 'blob://abc#pic-double' },
        { desktop: 'blob://abc#logo' },
      ],
      options: {
        targets: ['hero', 'head', 'photos', 'logo'],
        counts: [1, 1, 5, 1],
        hashes,
      },
    };

    const fileFieldName = 'photos';

    const expectedResult = [4, 0, 5, 12, 8];
    const result = createNewFilesIndexListFromUploadArgs(
      fileFieldName,
      values,
      uploadArgs,
      getHashFromValue,
    );
    expect(result).toEqual(expectedResult);
  });
});
