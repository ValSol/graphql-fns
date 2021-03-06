// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../../flowTypes';

import extractMissingAndPushDataFields from './extractMissingAndPushDataFields';

describe('extractMissingAndPushDataFields util', () => {
  const accessConfig: ThingConfig = {
    name: 'Access',

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

  const postConfig: ThingConfig = {};
  const restaurantConfig: ThingConfig = {};

  Object.assign(postConfig, {
    name: 'Post',

    textFields: [{ name: 'slug' }],

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

  test('should return empty object', () => {
    const data = {
      slug: 'Post slug',
    };
    const filter = [{}];

    const result = extractMissingAndPushDataFields(data, filter, restaurantConfig);

    const expectedResult = {};

    expect(result).toEqual(expectedResult);
  });

  test('should return empty object 2', () => {
    const data = {
      slug: 'Post slug',
      restaurant: { connect: 'restaurantId' },
    };
    const filter = [{ restaurant_: { access_: { postCreators: 'userId' } } }];

    const result = extractMissingAndPushDataFields(data, filter, postConfig);

    const expectedResult = {};

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
