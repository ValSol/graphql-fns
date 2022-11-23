// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../../flowTypes';

import extractMissingDataFields from './extractMissingDataFields';

describe('extractMissingDataFields util', () => {
  const accessConfig: ThingConfig = {
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

  const postConfig: ThingConfig = {};
  const restaurantConfig: ThingConfig = {};

  Object.assign(postConfig, {
    name: 'Post',
    type: 'tangible',

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
    type: 'tangible',

    textFields: [{ name: 'slug' }],

    relationalFields: [
      {
        name: 'access',
        config: accessConfig,
        index: true,
      },
    ],
  });

  test('should return not modified query', () => {
    const data = {
      slug: 'Post slug',
    };
    const filter = [{}];

    const result = extractMissingDataFields(data, filter);

    const expectedResult = {};

    expect(result).toEqual(expectedResult);
  });

  test('should return external references', () => {
    const data = {
      slug: 'Post slug',
      restaurant: { connect: 'restaurantId' },
    };
    const filter = [{ restaurant_: { access_: { postCreators: 'userId' } } }];

    const result = extractMissingDataFields(data, filter);

    const expectedResult = {};

    expect(result).toEqual(expectedResult);
  });

  test('should return external references 2', () => {
    const data = {
      slug: 'Post slug',
      restaurant: { connect: 'restaurantId' },
      restaurants: { connect: ['restaurantId-1', 'restaurantId-2'] },
    };
    const filter = [
      {
        restaurant_: { access_: { postCreators: 'userId' } },
        restaurants_: { access_: { postEditors: 'userId' } },
      },
    ];

    const result = extractMissingDataFields(data, filter);

    const expectedResult = {};

    expect(result).toEqual(expectedResult);
  });

  test('should return external references 3', () => {
    const data = {
      slug: 'Post slug',
      restaurant: { connect: 'restaurantId' },
      restaurants: { connect: ['restaurantId-1', 'restaurantId-2'] },
    };
    const filter = [
      {
        AND: [
          { restaurant_: { access_: { postCreators: 'userId' } } },
          { restaurants_: { access_: { postEditors: 'userId' } } },
        ],
      },
    ];

    const result = extractMissingDataFields(data, filter);

    const expectedResult = {};

    expect(result).toEqual(expectedResult);
  });

  test('should return external references for update', () => {
    const data = {
      slug: 'Post slug',
    };
    const filter = [
      {
        AND: [
          { show: true, restaurant_: { access_: { postCreators: 'userId' } } },
          { restaurants_: { access_: { postEditors: 'userId' } } },
        ],
      },
    ];

    const result = extractMissingDataFields(data, filter);

    const expectedResult = { _id: 1, show: 1, restaurant: 1, restaurants: 1 };

    expect(result).toEqual(expectedResult);
  });
});
