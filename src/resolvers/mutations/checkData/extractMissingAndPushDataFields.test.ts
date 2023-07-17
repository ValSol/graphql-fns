/* eslint-env jest */

import type { EntityConfig, TangibleEntityConfig } from '../../../tsTypes';

import extractMissingAndPushDataFields from './extractMissingAndPushDataFields';

describe('extractMissingAndPushDataFields util', () => {
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

    textFields: [{ name: 'slug', type: 'textFields' }],

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

    relationalFields: [
      {
        name: 'access',
        oppositeName: 'restaurants',
        config: accessConfig,
        index: true,
        type: 'relationalFields',
      },
    ],
  });

  test('should return empty object', () => {
    const data = {
      slug: 'Post slug',
    };
    const filter = [{}];

    const result = extractMissingAndPushDataFields(data, filter, restaurantConfig);

    const expectedResult: Record<string, any> = {};

    expect(result).toEqual(expectedResult);
  });

  test('should return empty object 2', () => {
    const data = {
      slug: 'Post slug',
      restaurant: { connect: 'restaurantId' },
    };
    const filter = [{ restaurant_: { access_: { postCreators: 'userId' } } }];

    const result = extractMissingAndPushDataFields(data, filter, postConfig);

    const expectedResult: Record<string, any> = {};

    expect(result).toEqual(expectedResult);
  });

  test('should return projection', () => {
    const data = {
      slug: 'Post slug',
      restaurant: { connect: 'restaurantId' },
    };
    const filter = [{ restaurant_: { access_: { postCreators: 'userId' } }, restaurants: [] }];

    const result = extractMissingAndPushDataFields(data, filter, postConfig);

    const expectedResult = { _id: 1, restaurants: 1 };

    expect(result).toEqual(expectedResult);
  });

  test('should return projection 2', () => {
    const data = {
      restaurant: { connect: 'restaurantId' },
      restaurants: ['restaurantId2'],
    };
    const filter = [
      {
        restaurant_: { access_: { postCreators: 'userId' } },
        restaurants_in: ['restaurantId2'],
        slug: 'test',
      },
    ];

    const result = extractMissingAndPushDataFields(data, filter, postConfig);

    const expectedResult = { _id: 1, restaurants: 1, slug: 1 };

    expect(result).toEqual(expectedResult);
  });
});
