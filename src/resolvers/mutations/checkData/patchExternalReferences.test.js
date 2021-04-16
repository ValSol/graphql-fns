// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../../flowTypes';

import patchExternalReferences from './patchExternalReferences';

describe('patchExternalReferences util', () => {
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

    textFields: [
      {
        name: 'slug',
      },
      {
        name: 'type',
        index: true,
      },
      {
        name: 'subType',
        index: true,
      },
    ],

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

    relationalFields: [
      {
        name: 'access',
        config: accessConfig,
        index: true,
      },
    ],
  });

  test('should return not modified query', () => {
    const externalReferences = [];

    const data = {
      slug: 'Post slug',
    };
    const filter = [{}];
    const toCreate = true;

    const result = patchExternalReferences(externalReferences, data, filter, postConfig, toCreate);

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
    const toCreate = true;

    const result = patchExternalReferences(externalReferences, data, filter, postConfig, toCreate);

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
    const toCreate = true;

    const result = patchExternalReferences(externalReferences, data, filter, postConfig, toCreate);

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
    const toCreate = true;

    const result = patchExternalReferences(externalReferences, data, filter, postConfig, toCreate);

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

  test('should return external references to update', () => {
    const externalReferences = ['restaurantId', 'restaurantId-1', 'restaurantId-2'];

    const data = {
      slug: 'Post slug',
      type: 'newsFeed',
      subType: 'afisha',
    };
    const filter = [
      {
        AND: [
          { restaurant_: { access_: { postCreators: 'userId' } } },
          { restaurants_: { access_: { postEditors: 'userId' } } },
          { OR: [{ type: 'newsFeed' }, { subType_in: ['afisha', 'actions'] }] },
        ],
      },
    ];
    const toCreate = false;

    const result = patchExternalReferences(externalReferences, data, filter, postConfig, toCreate);

    const expectedResult = {
      data: { slug: 'Post slug', type: 'newsFeed', subType: 'afisha' },

      filter: [
        { AND: [{}, {}, { OR: [{ type: 'newsFeed' }, { subType_in: ['afisha', 'actions'] }] }] },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return external references to update 2', () => {
    const externalReferences = ['restaurantId', 'restaurantId-1', 'restaurantId-2'];

    const data = {
      slug: 'Post slug',
    };
    const filter = [
      {
        AND: [
          {
            restaurant_: { access_: { postCreators: 'userId' } },
            type: 'newsFeed',
            slug_exists: true,
          },
          {
            restaurants_: { access_: { postEditors: 'userId' } },
            subType_in: ['afisha', 'actions'],
            slug_exists: true,
          },
        ],
      },
    ];
    const toCreate = false;

    const result = patchExternalReferences(externalReferences, data, filter, postConfig, toCreate);

    const expectedResult = {
      data: { slug: 'Post slug' },

      filter: [{ AND: [{ slug_exists: true }, { slug_exists: true }] }],
    };

    expect(result).toEqual(expectedResult);
  });
});
