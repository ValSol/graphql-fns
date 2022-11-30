// @flow
/* eslint-env jest */

import getProjectionFromInfo from './index';
import info from '../info.auxiliary';
import info2 from './info2.auxiliary';
import info3 from './info3.auxiliary';
import connectionInfo from './connectionInfo.auxiliary';

describe('getProjectionFromInfo', () => {
  test('should return object with fields from query info', () => {
    const result = getProjectionFromInfo(info);
    const expectedResult = { textField1: 1, textField3: 1, createdAt: 1 };
    expect(result).toEqual(expectedResult);
  });

  test('should return object with fields query info from root - path = []', () => {
    const path = [];
    const result = getProjectionFromInfo(info2, path);
    const expectedResult = { payload: 1, rating: 1 };
    expect(result).toEqual(expectedResult);
  });

  test('should return object with fields query info from 1st level - path = ["payload"]', () => {
    const path = ['payload'];
    const result = getProjectionFromInfo(info2, path);
    const expectedResult = { ukTitle: 1, commentList: 1 };
    expect(result).toEqual(expectedResult);
  });

  test('should return object with fields query info from 2nd level - path = ["payload", "commentList"]', () => {
    const path = ['payload', 'commentList'];
    const result = getProjectionFromInfo(info2, path);
    const expectedResult = { restaurant: 1 };
    expect(result).toEqual(expectedResult);
  });

  test('should return object with fields query info from 3th level - path = ["payload", "commentList", "restaurant"]', () => {
    const path = ['payload', 'commentList', 'restaurant'];
    const result = getProjectionFromInfo(info2, path);
    const expectedResult = { ruTitle: 1, commentList: 1 };
    expect(result).toEqual(expectedResult);
  });

  test('should return object with fields query info from 5th level - path = ["payload", "commentList", "restaurant", "commentList", "restaurant"]', () => {
    const path = ['payload', 'commentList', 'restaurant', 'commentList', 'restaurant'];
    const result = getProjectionFromInfo(info2, path);
    const expectedResult = { enTitle: 1 };
    expect(result).toEqual(expectedResult);
  });

  test('should return empty object with fields query info from 6th level - path = ["payload", "commentList", "restaurant", "commentList", "restaurant", "commentList"]', () => {
    const path = [
      'payload',
      'commentList',
      'restaurant',
      'commentList',
      'restaurant',
      'commentList',
    ];
    const result = getProjectionFromInfo(info2, path);
    const expectedResult = {};
    expect(result).toEqual(expectedResult);
  });

  test('should return object with fields query info from root - path = [] for node info', () => {
    const path = [];
    const result = getProjectionFromInfo(info3, path);
    const expectedResult = {
      banquetHall: 1,
      commentList: 1,
      conferenceHall: 1,
      menu: 1,
      ukTitle: 1,
    };
    expect(result).toEqual(expectedResult);
  });

  test('should return object with fields query info from root - path = ["edges", "node"] for connection info', () => {
    const path = ['edges', 'node'];
    const result = getProjectionFromInfo(connectionInfo, path);
    const expectedResult = {
      fullWidthIllustrations: 1,
      textBlocks: 1,
      ukTitle: 1,
    };
    expect(result).toEqual(expectedResult);
  });
});
