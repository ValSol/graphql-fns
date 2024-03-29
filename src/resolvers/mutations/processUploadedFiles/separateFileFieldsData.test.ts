/* eslint-env jest */
import type { EntityConfig } from '../../../tsTypes';

import separateFileFieldsData from './separateFileFieldsData';

describe('separateFileFieldsData', () => {
  const imageConfig: EntityConfig = {
    name: 'Image',
    type: 'file',
    textFields: [
      {
        name: 'fileId',
        type: 'textFields',
      },
      {
        name: 'address',
        type: 'textFields',
      },
    ],
  };
  const exampleConfig = {} as EntityConfig;
  Object.assign(exampleConfig, {
    name: 'Example',
    type: 'tangible',
    fileFields: [
      {
        name: 'logo',
        config: imageConfig,
        type: 'fileFields',
        variants: ['plain'],
      },
      {
        name: 'header',
        config: imageConfig,
        type: 'fileFields',
        variants: ['plain'],
      },
      {
        name: 'pictures',
        config: imageConfig,
        array: true,
        type: 'fileFields',
        variants: ['plain'],
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

    const options = {
      targets: ['logo', 'header', 'pictures'],
      counts: [1, 1, 2],
      hashes: ['pic1', 'pic2', 'pic3', 'pic4'],
    };

    const result = separateFileFieldsData(data, options, exampleConfig);

    const expectedResult = {
      forUpdate: { logo: data[0], header: data[1] },
      forPush: { pictures: [data[2], data[3]] },
    };

    expect(result).toEqual(expectedResult);
  });
});
