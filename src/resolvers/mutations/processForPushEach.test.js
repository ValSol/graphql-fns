// @flow
/* eslint-env jest */

import processForPushEach from './processForPushEach';

describe('processForPushEach', () => {
  test('should return wrapped object', () => {
    const data = {
      scores: [1, 5, 9],
      pictures: [
        { fileId: '111', address: '/images/pic1' },
        { fileId: '222', address: '/images/pic2' },
      ],
    };

    const result = processForPushEach(data);

    const expectedResult = {
      $push: {
        scores: {
          $each: [1, 5, 9],
        },
        pictures: {
          $each: [
            { fileId: '111', address: '/images/pic1' },
            { fileId: '222', address: '/images/pic2' },
          ],
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });
});
