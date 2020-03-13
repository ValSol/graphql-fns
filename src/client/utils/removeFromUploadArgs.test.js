// @flow
/* eslint-env jest */

// import type { ThingConfig } from '../../../flowTypes';

import removeFromUploadArgs from './removeFromUploadArgs';

describe('removeFromUploadArgs util', () => {
  test('should remove files for logo field to empty args object', () => {
    const files = [{ name: 'pic1.png', type: 'image/png' }];
    const prevArgs = {
      files,
      options: {
        targets: ['logo'],
        counts: [1],
        hashes: ['pic1'],
      },
    };
    const fileFieldName = 'logo';
    const hashes = ['pic1'];
    const result = removeFromUploadArgs(hashes, fileFieldName, prevArgs);
    const expectedResult = {
      files: [],
      options: {
        targets: [],
        counts: [],
        hashes: [],
      },
    };
    expect(result).toEqual(expectedResult);
  });

  test('should remove files field', () => {
    const files = [
      { name: 'pic1.png', type: 'image/png' },
      { name: 'pic2.png', type: 'image/png' },
      { name: 'pic3.png', type: 'image/png' },
      { name: 'pic4.png', type: 'image/png' },
      { name: 'pic5.png', type: 'image/png' },
    ];
    const fileFieldName = 'pictures';
    const hashes = ['pic1', 'pic3', 'pic5'];
    const prevArgs = {
      files,
      options: {
        targets: ['pictures'],
        counts: [5],
        hashes: ['pic1', 'pic2', 'pic3', 'pic4', 'pic5'],
      },
    };
    const result = removeFromUploadArgs(hashes, fileFieldName, prevArgs);

    const expectedResult = {
      files: [
        { name: 'pic2.png', type: 'image/png' },
        { name: 'pic4.png', type: 'image/png' },
      ],
      options: {
        targets: ['pictures'],
        counts: [2],
        hashes: ['pic2', 'pic4'],
      },
    };
    expect(result).toEqual(expectedResult);
  });

  test('should remove files field 2', () => {
    const files = [
      { name: 'pic1.png', type: 'image/png' },
      { name: 'pic2.png', type: 'image/png' },
      { name: 'pic3.png', type: 'image/png' },
      { name: 'pic1.png', type: 'image/png' },
      { name: 'pic1.png', type: 'image/png' },
      { name: 'pic6.png', type: 'image/png' },
      { name: 'pic7.png', type: 'image/png' },
    ];
    const fileFieldName = 'pictures';
    const hashes = ['pic1', 'pic3', 'pic6'];
    const prevArgs = {
      files,
      options: {
        targets: ['logo', 'header', 'pictures'],
        counts: [1, 1, 5],
        hashes: ['pic1', 'pic2', 'pic3', 'pic1', 'pic1', 'pic6', 'pic7'],
      },
    };
    const result = removeFromUploadArgs(hashes, fileFieldName, prevArgs);

    const expectedResult = {
      files: [
        { name: 'pic1.png', type: 'image/png' },
        { name: 'pic2.png', type: 'image/png' },
        { name: 'pic7.png', type: 'image/png' },
      ],
      options: {
        targets: ['logo', 'header', 'pictures'],
        counts: [1, 1, 1],
        hashes: ['pic1', 'pic2', 'pic7'],
      },
    };
    expect(result).toEqual(expectedResult);
  });

  test('should remove files field 3', () => {
    const files = [
      { name: 'pic1.png', type: 'image/png' },
      { name: 'pic2.png', type: 'image/png' },
      { name: 'pic3.png', type: 'image/png' },
      { name: 'pic1.png', type: 'image/png' },
      { name: 'pic1.png', type: 'image/png' },
      { name: 'pic6.png', type: 'image/png' },
      { name: 'pic7.png', type: 'image/png' },
    ];
    const fileFieldName = 'logo';
    const hashes = ['pic1'];
    const prevArgs = {
      files,
      options: {
        targets: ['logo', 'header', 'pictures'],
        counts: [1, 1, 5],
        hashes: ['pic1', 'pic2', 'pic3', 'pic1', 'pic1', 'pic6', 'pic7'],
      },
    };
    const result = removeFromUploadArgs(hashes, fileFieldName, prevArgs);

    const expectedResult = {
      files: [
        { name: 'pic2.png', type: 'image/png' },
        { name: 'pic3.png', type: 'image/png' },
        { name: 'pic1.png', type: 'image/png' },
        { name: 'pic1.png', type: 'image/png' },
        { name: 'pic6.png', type: 'image/png' },
        { name: 'pic7.png', type: 'image/png' },
      ],
      options: {
        targets: ['header', 'pictures'],
        counts: [1, 5],
        hashes: ['pic2', 'pic3', 'pic1', 'pic1', 'pic6', 'pic7'],
      },
    };
    expect(result).toEqual(expectedResult);
  });
});
