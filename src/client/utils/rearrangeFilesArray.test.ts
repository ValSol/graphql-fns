/* eslint-env jest */

import rearrangeFilesArray from './rearrangeFilesArray';

describe('rearrangeFilesArray util', () => {
  test('should return new list of values', () => {
    const values = [
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

    const uploadedValues = [
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

    const hashIndexes = [4, 0, 8, 12, 5];

    const expectedResult = [
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
    ];

    const result = rearrangeFilesArray(hashIndexes, values, uploadedValues);
    expect(result).toEqual(expectedResult);
  });

  test('should return same list if hashIndexes empty', () => {
    const values = [
      { desktop: 'http://path1' }, // 1
      { desktop: 'http://path2' }, // 2
      { desktop: 'http://path3' }, // 3
      { desktop: 'http://path4' }, // 6
      { desktop: 'http://path5' }, // 7
      { desktop: 'http://path6' }, // 9
      { desktop: 'http://path7' }, // 10
      { desktop: 'http://path8' }, // 11
    ];
    const uploadedValues = [
      // if hasIndex is empty - upladedValues may be any
      { desktop: 'http://path1' },
      { desktop: 'http://path3' },
      { desktop: 'http://path6' },
      { desktop: 'http://path9' },
      { desktop: 'http://path10' },
    ];

    const hashIndexes: Array<any> = [];

    const result = rearrangeFilesArray(hashIndexes, values, uploadedValues);
    expect(result).toEqual(values);
  });
});
