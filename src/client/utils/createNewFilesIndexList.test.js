// @flow
/* eslint-env jest */

import getHashFromValue from './getHashFromValue';
import createNewFilesIndexList from './createNewFilesIndexList';

describe('createNewFilesIndexList util', () => {
  test('should return new files index list', () => {
    const hashes = ['pic1', 'pic2', 'pic3', 'pic4', 'pic5'];
    const fileFieldValues = [
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
    const expectedResult = [4, 0, 8, 12, 5];
    const result = createNewFilesIndexList(hashes, fileFieldValues, getHashFromValue);
    expect(result).toEqual(expectedResult);
  });

  test('should return new files empty list', () => {
    const hashes = [];
    const fileFieldValues = [
      { desktop: 'http://path1' }, // 1
      { desktop: 'http://path2' }, // 2
      { desktop: 'http://path3' }, // 3
      { desktop: 'http://path4' }, // 6
      { desktop: 'http://path5' }, // 7
      { desktop: 'http://path6' }, // 9
      { desktop: 'http://path7' }, // 10
      { desktop: 'http://path8' }, // 11
    ];
    const expectedResult = [];
    const result = createNewFilesIndexList(hashes, fileFieldValues, getHashFromValue);
    expect(result).toEqual(expectedResult);
  });
});
