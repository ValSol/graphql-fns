/* eslint-env jest */

import addToUploadArgs from './addToUploadArgs';

describe('addToUploadArgs util', () => {
  const createHash = async ({ name }: any) => `${name.slice(0, -4)}`;

  test('should add files for logo field to empty args object', async () => {
    const files = [{ name: 'pic1.png', type: 'image/png' }];
    const fileFieldName = 'logo';
    const prevArgs = {
      files: [],
      options: {
        targets: [],
        counts: [],
        hashes: [],
      },
    };
    const result = await addToUploadArgs(files, fileFieldName, prevArgs, createHash);
    const expectedResult = {
      files,
      options: {
        targets: ['logo'],
        counts: [1],
        hashes: ['pic1'],
      },
    };
    expect(result).toEqual(expectedResult);
  });

  test('should add files for pictures field after files for pictures field', async () => {
    const prevFiles = [
      { name: 'pic1.png', type: 'image/png' },
      { name: 'pic2.png', type: 'image/png' },
    ];

    const files = [
      { name: 'pic3.png', type: 'image/png' },
      { name: 'pic4.png', type: 'image/png' },
      { name: 'pic5.png', type: 'image/png' },
    ];
    const fileFieldName = 'pictures';
    const prevArgs = {
      files: prevFiles,
      options: {
        targets: ['pictures'],
        counts: [2],
        hashes: ['pic1', 'pic2'],
      },
    };
    const result = await addToUploadArgs(files, fileFieldName, prevArgs, createHash);

    const expectedResult = {
      files: [...prevFiles, ...files],
      options: {
        targets: ['pictures'],
        counts: [5],
        hashes: ['pic1', 'pic2', 'pic3', 'pic4', 'pic5'],
      },
    };
    expect(result).toEqual(expectedResult);
  });

  test('should add files for photos field after files for pictures field', async () => {
    const prevFiles = [
      { name: 'pic1.png', type: 'image/png' },
      { name: 'pic2.png', type: 'image/png' },
    ];

    const files = [
      { name: 'photo1.jpg', type: 'image/jpeg' },
      { name: 'photo2.jpg', type: 'image/jpeg' },
      { name: 'photo3.jpg', type: 'image/jpeg' },
    ];
    const fileFieldName = 'photos';
    const prevArgs = {
      files: prevFiles,
      options: {
        targets: ['pictures'],
        counts: [2],
        hashes: ['pic1', 'pic2'],
      },
    };
    const result = await addToUploadArgs(files, fileFieldName, prevArgs, createHash);

    const expectedResult = {
      files: [...prevFiles, ...files],
      options: {
        targets: ['pictures', 'photos'],
        counts: [2, 3],
        hashes: ['pic1', 'pic2', 'photo1', 'photo2', 'photo3'],
      },
    };

    expect(result).toEqual(expectedResult);
  });

  test('should add files for photos field after files for pictures field 2', async () => {
    const prevFiles = [
      { name: 'pic1.png', type: 'image/png' },
      { name: 'pic2.png', type: 'image/png' },
      { name: 'pic4.png', type: 'image/png' },
    ];

    const files = [
      { name: 'photo1.jpg', type: 'image/jpeg' },
      { name: 'photo2.jpg', type: 'image/jpeg' },
      { name: 'photo3.jpg', type: 'image/jpeg' },
    ];
    const fileFieldName = 'pictures';
    const prevArgs = {
      files: prevFiles,
      options: {
        targets: ['pictures', 'logo'],
        counts: [2, 1],
        hashes: ['pic1', 'pic2', 'pic4'],
      },
    };
    const result = await addToUploadArgs(files, fileFieldName, prevArgs, createHash);

    const expectedResult = {
      files: [
        { name: 'pic1.png', type: 'image/png' },
        { name: 'pic2.png', type: 'image/png' },
        { name: 'photo1.jpg', type: 'image/jpeg' },
        { name: 'photo2.jpg', type: 'image/jpeg' },
        { name: 'photo3.jpg', type: 'image/jpeg' },
        { name: 'pic4.png', type: 'image/png' },
      ],
      options: {
        targets: ['pictures', 'logo'],
        counts: [5, 1],
        hashes: ['pic1', 'pic2', 'photo1', 'photo2', 'photo3', 'pic4'],
      },
    };

    expect(result).toEqual(expectedResult);
  });
});
