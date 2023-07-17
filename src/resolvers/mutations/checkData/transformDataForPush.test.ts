/* eslint-env jest */

import type { EntityConfig, TangibleEntityConfig } from '../../../tsTypes';

import transformDataForPush from './transformDataForPush';

describe('transformDataForPush util', () => {
  const postConfig = {} as EntityConfig;
  const restaurantConfig = {} as TangibleEntityConfig;

  const accessConfig: EntityConfig = {
    name: 'Access',
    type: 'tangible',

    textFields: [
      { name: 'postCreators', array: true, index: true, type: 'textFields' },
      { name: 'postEditors', array: true, index: true, type: 'textFields' },
      { name: 'postPublishers', array: true, index: true, type: 'textFields' },
      { name: 'postTogglers', array: true, index: true, type: 'textFields' },
      { name: 'restaurantCreators', array: true, index: true, type: 'textFields' },
      { name: 'restaurantEditors', array: true, index: true, type: 'textFields' },
      { name: 'restaurantPublishers', array: true, index: true, type: 'textFields' },
      { name: 'restaurantTogglers', array: true, index: true, type: 'textFields' },
    ],
    relationalFields: [
      {
        name: 'restaurants',
        oppositeName: 'access',
        config: restaurantConfig,
        array: true,
        parent: true,
        type: 'relationalFields',
      },
    ],
  };

  Object.assign(postConfig, {
    name: 'Post',
    type: 'tangible',

    textFields: [
      { name: 'slug', type: 'textFields' },
      { name: 'arrField', array: true, index: true, type: 'textFields' },
    ],

    enumFields: [
      {
        name: 'publications',
        enumName: 'Publications',
        index: true,
        type: 'enumFields',
      },
      {
        name: 'newsFeed',
        enumName: 'NewsFeed',
        index: true,
        type: 'enumFields',
      },
      {
        name: 'events',
        enumName: 'Events',
        index: true,
        type: 'enumFields',
      },
      {
        name: 'journal',
        enumName: 'Journal',
        index: true,
        type: 'enumFields',
      },
      {
        name: 'toProfessionals',
        enumName: 'ToProfessionals',
        index: true,
        type: 'enumFields',
      },
    ],

    relationalFields: [
      {
        name: 'restaurant',
        oppositeName: 'mainPosts',
        config: restaurantConfig,
        index: true,
        type: 'relationalFields',
      },
      {
        name: 'restaurants',
        oppositeName: 'posts',
        config: restaurantConfig,
        array: true,
        index: true,
        type: 'relationalFields',
      },
    ],
  });

  Object.assign(restaurantConfig, {
    name: 'Restaurant',
    type: 'tangible',

    textFields: [{ name: 'slug', type: 'textFields' }],

    enumFields: [
      {
        name: 'cuisines',
        enumName: 'Cuisines',
        array: true,
        index: true,
        type: 'enumFields',
      },
    ],

    relationalFields: [
      {
        name: 'access',
        oppositeName: 'restaurants',
        config: accessConfig,
        index: true,
        type: 'relationalFields',
      },
      {
        name: 'mainPosts',
        oppositeName: 'restaurant',
        config: postConfig,
        array: true,
        parent: true,
        type: 'relationalFields',
      },
      {
        name: 'posts',
        oppositeName: 'restaurants',
        config: postConfig,
        array: true,
        parent: true,
        type: 'relationalFields',
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

    const currentData = {
      restaurants: ['restaurantId0', 'restaurantId2', 'restaurantId4'],
    };

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

  test('should return updated data', () => {
    const data = {
      restaurant: { connect: 'restaurantId' },
      restaurants: { connect: ['restaurantId2', 'restaurantId3'] },
    };

    const args = { data, positions: undefined };

    const currentData = { restaurants: ['restaurantId0', 'restaurantId1'] };

    const expectedResult = {
      restaurants: ['restaurantId0', 'restaurantId1', 'restaurantId2', 'restaurantId3'],
    };

    const result = transformDataForPush(currentData, args, postConfig);

    expect(result).toEqual(expectedResult);
  });
});
