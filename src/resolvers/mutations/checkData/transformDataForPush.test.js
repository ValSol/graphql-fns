// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../../flowTypes';

import transformDataForPush from './transformDataForPush';

describe('transformDataForPush util', () => {
  const accessConfig: EntityConfig = {
    name: 'Access',
    type: 'tangible',

    textFields: [
      { name: 'postCreators', array: true, index: true },
      { name: 'postEditors', array: true, index: true },
      { name: 'postPublishers', array: true, index: true },
      { name: 'postTogglers', array: true, index: true },
      { name: 'restaurantCreators', array: true, index: true },
      { name: 'restaurantEditors', array: true, index: true },
      { name: 'restaurantPublishers', array: true, index: true },
      { name: 'restaurantTogglers', array: true, index: true },
    ],
  };

  const postConfig: EntityConfig = {};
  const restaurantConfig: EntityConfig = {};

  Object.assign(postConfig, {
    name: 'Post',
    type: 'tangible',

    textFields: [{ name: 'slug' }, { name: 'arrField', array: true, index: true }],

    enumFields: [
      {
        name: 'publications',
        enumName: 'Publications',
        index: true,
      },
      {
        name: 'newsFeed',
        enumName: 'NewsFeed',
        index: true,
      },
      {
        name: 'events',
        enumName: 'Events',
        index: true,
      },
      {
        name: 'journal',
        enumName: 'Journal',
        index: true,
      },
      {
        name: 'toProfessionals',
        enumName: 'ToProfessionals',
        index: true,
      },
    ],

    relationalFields: [
      {
        name: 'restaurant',
        config: restaurantConfig,
        index: true,
      },
      {
        name: 'restaurants',
        config: restaurantConfig,
        array: true,
        index: true,
      },
    ],
  });

  Object.assign(restaurantConfig, {
    name: 'Restaurant',
    type: 'tangible',

    textFields: [{ name: 'slug' }],

    enumFields: [
      {
        name: 'cuisines',
        enumName: 'Cuisines',
        array: true,
        index: true,
      },
    ],

    relationalFields: [
      {
        name: 'access',
        config: accessConfig,
        index: true,
      },
    ],
  });

  test('should return updated data', () => {
    const data = {
      restaurant: { connect: 'restaurantId' },
      arrField: ['test2', 'test3'],
    };

    const args = { data };

    const currentData = { arrField: ['test0', 'test1'] };

    const expectedResult = {
      arrField: ['test0', 'test1', 'test2', 'test3'],
    };

    const result = transformDataForPush(currentData, args, postConfig);

    expect(result).toEqual(expectedResult);
  });

  test('should return updated data', () => {
    const data = {
      restaurant: { connect: 'restaurantId' },
    };

    const args = { data };

    const currentData = { arrField: ['test0', 'test1'] };

    const expectedResult = {
      arrField: ['test0', 'test1'],
    };

    const result = transformDataForPush(currentData, args, postConfig);

    expect(result).toEqual(expectedResult);
  });

  test('should return updated data with positions', () => {
    const data = {
      restaurant: { connect: 'restaurantId' },
      arrField: ['test1', 'test3'],
    };

    const positions = { arrField: [1, 3] };

    const args = { data, positions };

    const currentData = { arrField: ['test0', 'test2', 'test4'] };

    const expectedResult = {
      arrField: ['test0', 'test1', 'test2', 'test3', 'test4'],
    };

    const result = transformDataForPush(currentData, args, postConfig);

    expect(result).toEqual(expectedResult);
  });

  test('should return updated data with positions', () => {
    const data = {
      restaurant: { connect: 'restaurantId' },
      restaurants: { connect: ['restaurantId1', 'restaurantId3'] },
    };

    const positions = { restaurants: [1, 3] };

    const args = { data, positions };

    const currentData = { restaurants: ['restaurantId0', 'restaurantId2', 'restaurantId4'] };

    const expectedResult = {
      restaurants: [
        'restaurantId0',
        'restaurantId1',
        'restaurantId2',
        'restaurantId3',
        'restaurantId4',
      ],
    };

    const result = transformDataForPush(currentData, args, postConfig);

    expect(result).toEqual(expectedResult);
  });

  test.skip('should return updated data', () => {
    const data = {
      restaurant: { connect: 'restaurantId' },
      restaurants: { connect: ['restaurantId0', 'restaurantId1'] },
    };

    const args = { data, positions: undefined };

    const currentData = { restaurants: ['restaurantId2', 'restaurantId3'] };

    const expectedResult = {
      restaurant: { connect: 'restaurantId' },
      restaurants: {
        connect: ['restaurantId0', 'restaurantId1', 'restaurantId2', 'restaurantId3'],
      },
    };

    const result = transformDataForPush(currentData, args, postConfig);

    expect(result).toEqual(expectedResult);
  });
});
