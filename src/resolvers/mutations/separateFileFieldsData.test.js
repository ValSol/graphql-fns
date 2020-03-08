// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import separateFileFieldsData from './separateFileFieldsData';

describe('separateFileFieldsData', () => {
  const imageConfig: ThingConfig = {
    name: 'Image',
    embedded: true,
    textFields: [
      {
        name: 'fileId',
      },
      {
        name: 'address',
      },
    ],
  };
  const exampleConfig: ThingConfig = {};
  Object.assign(exampleConfig, {
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
        name: 'pictures',
        config: imageConfig,
        array: true,
      },
    ],
  });

  test('should return wrapped object', () => {
    const data = [
      {
        desktop: '/images/pic1-desktop.png',
        tablet: '/images/pic1-tablet.png',
        moblie: '/images/pic1-moblie.png',
      },
      {
        desktop: '/images/pic2-desktop.png',
        tablet: '/images/pic2-tablet.png',
        moblie: '/images/pic2-moblie.png',
      },
      {
        desktop: '/images/pic3-desktop.png',
        tablet: '/images/pic3-tablet.png',
        moblie: '/images/pic3-moblie.png',
      },
      {
        desktop: '/images/pic4-desktop.png',
        tablet: '/images/pic4-tablet.png',
        moblie: '/images/pic4-moblie.png',
      },
    ];

    const options = { targets: ['logo', 'header', 'pictures'], counts: [1, 1, 2] };

    const result = separateFileFieldsData(data, options, exampleConfig);

    const expectedResult = {
      forUpdate: { logo: data[0], header: data[1] },
      forPush: { pictures: [data[2], data[3]] },
    };

    expect(result).toEqual(expectedResult);
  });
});
