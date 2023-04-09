/* eslint-env jest */

import type { EntityConfig } from '../../../tsTypes';

import extractMissingDataFields from './extractMissingDataFields';

describe('extractMissingDataFields util', () => {
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
  };

  const postConfig = {} as EntityConfig;
  const restaurantConfig = {} as EntityConfig;

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
        config: restaurantConfig,
        index: true,
        type: 'relationalFields',
      },
      {
        name: 'restaurants',
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

    relationalFields: [
      {
        name: 'access',
        config: accessConfig,
        index: true,
        type: 'relationalFields',
      },
    ],
  });

  test('should return not modified query', () => {
    const data = {
      slug: 'Post slug',
    };
    const filter = [{}];

    const result = extractMissingDataFields(data, filter);

    const expectedResult: Record<string, any> = {};

    expect(result).toEqual(expectedResult);
  });

  test('should return external references', () => {
    const data = {
      slug: 'Post slug',
      restaurant: { connect: 'restaurantId' },
    };
    const filter = [{ restaurant_: { access_: { postCreators: 'userId' } } }];

    const result = extractMissingDataFields(data, filter);

    const expectedResult: Record<string, any> = {};

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

    const expectedResult: Record<string, any> = {};

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

    const expectedResult: Record<string, any> = {};

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
