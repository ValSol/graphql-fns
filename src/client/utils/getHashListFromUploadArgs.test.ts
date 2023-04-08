/* eslint-env jest */

import getHashListFromUploadArgs from './getHashListFromUploadArgs';

describe('getHashListFromUploadArgs util', () => {
  test('should return hash list', () => {
    const files = [
      { name: 'pic1.png', type: 'image/png' },
      { name: 'pic2.png', type: 'image/png' },
      { name: 'pic3.png', type: 'image/png' },
      { name: 'pic1.png', type: 'image/png' },
      { name: 'pic1.png', type: 'image/png' },
      { name: 'pic6.png', type: 'image/png' },
      { name: 'pic7.png', type: 'image/png' },
    ];

    const uploadArgs = {
      files,
      options: {
        targets: ['logo', 'avatars', 'pictures', 'photos'],
        counts: [1, 3, 4, 2],
        hashes: [
          'logo',
          'ava1',
          'ava2',
          'ava3',
          'pic1',
          'pic2',
          'pic3',
          'pic4',
          'photo1',
          'photo2',
        ],
      },
    };

    const fieldName = 'pictures';

    const expectedResult = ['pic1', 'pic2', 'pic3', 'pic4'];

    const result = getHashListFromUploadArgs(fieldName, uploadArgs);
    expect(result).toEqual(expectedResult);
  });

  test('should return empty hash list', () => {
    const files = [
      { name: 'pic1.png', type: 'image/png' },
      { name: 'pic2.png', type: 'image/png' },
      { name: 'pic3.png', type: 'image/png' },
      { name: 'pic1.png', type: 'image/png' },
      { name: 'pic1.png', type: 'image/png' },
      { name: 'pic6.png', type: 'image/png' },
      { name: 'pic7.png', type: 'image/png' },
    ];

    const uploadArgs = {
      files,
      options: {
        targets: ['logo', 'avatars', 'cards', 'photos'],
        counts: [1, 3, 4, 2],
        hashes: [
          'logo',
          'ava1',
          'ava2',
          'ava3',
          'pic1',
          'pic2',
          'pic3',
          'pic4',
          'photo1',
          'photo2',
        ],
      },
    };

    const fieldName = 'pictures';

    const expectedResult: Array<any> = [];

    const result = getHashListFromUploadArgs(fieldName, uploadArgs);
    expect(result).toEqual(expectedResult);
  });
});
