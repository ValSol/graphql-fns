/* eslint-env jest */

import type { EntityConfig, TangibleEntityConfig } from '../../../tsTypes';

import patchExternalReferences from './patchExternalReferences';

describe('patchExternalReferences util', () => {
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
        index: true,
        type: 'relationalFields',
      },
    ],
  };

  Object.assign(postConfig, {
    name: 'Post',
    type: 'tangible',

    textFields: [
      {
        name: 'slug',
        type: 'textFields',
      },
      {
        name: 'type',
        index: true,
        type: 'textFields',
      },
      {
        name: 'subType',
        index: true,
        type: 'textFields',
      },
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

  test('should return not modified query', () => {
    const externalReferences: Array<any> = [];

    const data = {
      slug: 'Post slug',
    };
    const filter = [{}];

    const result = patchExternalReferences(externalReferences, data, filter, postConfig);

    const expectedResult = {
      data: {
        slug: 'Post slug',
      },
      filter: [{}],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return external references', () => {
    const externalReferences = ['restaurantId'];

    const data = {
      slug: 'Post slug',
      restaurant: { connect: 'restaurantId' },
    };
    const filter = [{ restaurant_: { access_: { postCreators: 'userId' } } }];

    const result = patchExternalReferences(externalReferences, data, filter, postConfig);

    const expectedResult = {
      data: {
        slug: 'Post slug',
        restaurant: 'restaurantId',
      },
      filter: [{ restaurant: 'restaurantId' }],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return external references 2', () => {
    const externalReferences = ['restaurantId', 'restaurantId-1', 'restaurantId-2'];

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

    const result = patchExternalReferences(externalReferences, data, filter, postConfig);

    const expectedResult = {
      data: {
        slug: 'Post slug',
        restaurant: 'restaurantId',
        restaurants: ['restaurantId-1', 'restaurantId-2'],
      },
      filter: [
        { restaurant: 'restaurantId', restaurants_in: ['restaurantId-1', 'restaurantId-2'] },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return external references 4', () => {
    const externalReferences = ['restaurantId', 'restaurantId-1', 'restaurantId-2'];

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

    const result = patchExternalReferences(externalReferences, data, filter, postConfig);

    const expectedResult = {
      data: {
        slug: 'Post slug',
        restaurant: 'restaurantId',
        restaurants: ['restaurantId-1', 'restaurantId-2'],
      },

      filter: [
        {
          AND: [
            { restaurant: 'restaurantId' },
            { restaurants_in: ['restaurantId-1', 'restaurantId-2'] },
          ],
        },
      ],
    };

    expect(result).toEqual(expectedResult);
  });
});
