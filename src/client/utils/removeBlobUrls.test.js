/** @flow
 * @jest-environment jsdom
 */

/* eslint-env jest */

import getBlobUrlFromValue from './getBlobUrlFromValue';
import removeBlobUrls from './removeBlobUrls';

describe('removeBlobUrls util', () => {
  const revoked = [];

  beforeEach(() => {
    window.URL.revokeObjectURL = jest.fn((url) => {
      if (url) revoked.push(url);
    });
  });

  afterEach(() => {
    window.URL.revokeObjectURL.mockReset();
  });

  test('should return new list of values', () => {
    const imageConfig = {
      name: 'Image',
      embedded: true,
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
    const exampleConfig = {
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
      { desktop: 'blob://abc#pic2', tablet: 'blob://pic2' },
      { desktop: 'http://path1', tablet: 'http://path1' },
      { desktop: 'http://path2', tablet: 'http://path2' },
      { desktop: 'http://path3', tablet: 'http://path3' },
      { desktop: 'blob://abc#pic1', tablet: 'blob://pic1' },
      { desktop: 'blob://abc#pic5', tablet: 'blob://pic5' },
      { desktop: 'http://path4', tablet: 'http://path4' },
      { desktop: 'http://path5', tablet: 'http://path5' },
      { desktop: 'blob://abc#pic3', tablet: 'blob://pic3' },
      { desktop: 'http://path6', tablet: 'http://path6' },
      { desktop: 'http://path7', tablet: 'http://path7' },
      { desktop: 'http://path8', tablet: 'http://path8' },
      { desktop: 'blob://abc#pic4', tablet: 'blob://pic4' },
    ];

    const values = {
      title: 'Short Name',
      avatars: [
        { desktop: 'http://avatar1', tablet: 'http://avatar1' },
        { desktop: 'http://avatar2', tablet: 'http://avatar2' },
      ],
      logo: { desktop: 'blob://abc#logo', tablet: 'blob://logo' },
      hero: { desktop: 'http://hero', tablet: 'http://hero' },
      header: { desktop: 'blob://abc#header', tablet: 'blob://header' },
      photos,
    };

    removeBlobUrls(values, getBlobUrlFromValue, exampleConfig);

    const expectedRevoked = [
      'blob://logo',
      'blob://header',
      'blob://pic2',
      'blob://pic1',
      'blob://pic5',
      'blob://pic3',
      'blob://pic4',
    ];
    expect(revoked).toEqual(expectedRevoked);
  });
});
