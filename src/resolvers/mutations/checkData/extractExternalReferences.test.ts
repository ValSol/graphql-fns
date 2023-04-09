/* eslint-env jest */

import type { EntityConfig } from '../../../tsTypes';

import extractExternalReferences from './extractExternalReferences';

describe('extractExternalReferences util', () => {
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

    const result = extractExternalReferences(data, filter, postConfig);

    const expectedResult: Array<any> = [];

    expect(result).toEqual(expectedResult);
  });

  test('should return external references', () => {
    const data = {
      slug: 'Post slug',
      restaurant: { connect: 'restaurantId' },
    };
    const filter = [{ restaurant_: { access_: { postCreators: 'userId' } } }];

    const result = extractExternalReferences(data, filter, postConfig);

    const expectedResult = [
      ['Restaurant', 'restaurantId', [{ access_: { postCreators: 'userId' } }]],
    ];

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

    const result = extractExternalReferences(data, filter, postConfig);

    const expectedResult = [
      ['Restaurant', 'restaurantId', [{ access_: { postCreators: 'userId' } }]],
      ['Restaurant', 'restaurantId-1', [{ access_: { postEditors: 'userId' } }]],
      ['Restaurant', 'restaurantId-2', [{ access_: { postEditors: 'userId' } }]],
    ];

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

    const result = extractExternalReferences(data, filter, postConfig);

    const expectedResult = [
      ['Restaurant', 'restaurantId', [{ access_: { postCreators: 'userId' } }]],
      ['Restaurant', 'restaurantId-1', [{ access_: { postEditors: 'userId' } }]],
      ['Restaurant', 'restaurantId-2', [{ access_: { postEditors: 'userId' } }]],
    ];

    expect(result).toEqual(expectedResult);
  });
});
