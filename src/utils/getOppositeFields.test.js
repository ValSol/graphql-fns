// @flow
/* eslint-env jest */

import type { ThingConfig } from '../flowTypes';

import getOppositeFields from './getOppositeFields';

describe('getOppositeFields util', () => {
  const personConfig: ThingConfig = {};
  const placeConfig: ThingConfig = {
    name: 'Place',
    type: 'tangible',
    textFields: [{ name: 'name' }],
    duplexFields: [
      {
        name: 'citizens',
        oppositeName: 'location',
        array: true,
        config: personConfig,
      },
      {
        name: 'visitors',
        oppositeName: 'favoritePlace',
        array: true,
        config: personConfig,
      },
    ],
  };
  Object.assign(personConfig, {
    name: 'Person',
    type: 'tangible',
    textFields: [
      {
        name: 'firstName',
        required: true,
      },
      {
        name: 'lastName',
        required: true,
      },
    ],
    duplexFields: [
      {
        name: 'friends',
        oppositeName: 'friends',
        config: personConfig,
        array: true,
        required: true,
      },
      {
        name: 'enemies',
        oppositeName: 'enemies',
        array: true,
        config: personConfig,
      },
      {
        name: 'location',
        oppositeName: 'citizens',
        config: placeConfig,
        required: true,
      },
      {
        name: 'favoritePlace',
        oppositeName: 'visitors',
        config: placeConfig,
      },
    ],
  });

  test('should return opposite fields for placeConfig', () => {
    const thingConfig = placeConfig;

    const expectedResult = [
      [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          config: personConfig,
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
        },
      ],
      [
        {
          name: 'visitors',
          oppositeName: 'favoritePlace',
          array: true,
          config: personConfig,
        },
        {
          name: 'favoritePlace',
          oppositeName: 'visitors',
          config: placeConfig,
        },
      ],
    ];

    const result = getOppositeFields(thingConfig);

    expect(result).toEqual(expectedResult);
  });

  test('should return opposite fields for personConfig', () => {
    const thingConfig = personConfig;

    const expectedResult = [
      [
        {
          name: 'friends',
          oppositeName: 'friends',
          config: personConfig,
          array: true,
          required: true,
        },
        {
          name: 'friends',
          oppositeName: 'friends',
          config: personConfig,
          array: true,
          required: true,
        },
      ],
      [
        {
          name: 'enemies',
          oppositeName: 'enemies',
          array: true,
          config: personConfig,
        },
        {
          name: 'enemies',
          oppositeName: 'enemies',
          array: true,
          config: personConfig,
        },
      ],
      [
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
        },
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          config: personConfig,
        },
      ],
      [
        {
          name: 'favoritePlace',
          oppositeName: 'visitors',
          config: placeConfig,
        },
        {
          name: 'visitors',
          oppositeName: 'favoritePlace',
          array: true,
          config: personConfig,
        },
      ],
    ];

    const result = getOppositeFields(thingConfig);

    expect(result).toEqual(expectedResult);
  });
});
