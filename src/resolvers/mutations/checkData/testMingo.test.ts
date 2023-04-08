/* eslint-env jest */

import mingo from 'mingo';

import type { EntityConfig } from '../../../tsTypes';

import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';

describe('patchExternalReferences util', () => {
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

  const postConfig = {} as EntityConfig;
  const restaurantConfig = {} as EntityConfig;

  Object.assign(postConfig, {
    name: 'Post',
    type: 'tangible',

    textFields: [
      {
        name: 'slug',
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

  test('should return true', () => {
    const data = {
      restaurants: ['5f10131484fbb2003bf1b8fb'],
      ukTitle: 'Тест українською 23',
      ruTitle: 'Текст по русски 23',
      enTitle: 'Test in English 23',
      ukSummary: 'Тест українською 23',
      ruSummary: 'Текст по русски 23',
      enSummary: 'Test in English 23',
      slug: 'europe',
      editedAt: '2021-04-15T05:08:06.739Z',
      startAt: '2021-04-15T05:06:52.000Z',
      endAt: null,
      show: false,
      notShare: false,
      publications: 'NewsFeed',
      newsFeed: 'Promotions',
      events: null,
      journal: '',
      toProfessionals: null,
      restaurant: '5f10131484fbb2003bf1b8fb',
      textBlocks: [
        {
          ukText: 'Тест українською 23',
          ruText: 'Текст по русски 23',
          enText: 'Test in English 23',
          index: 0,
        },
      ],
      photoBlocks: [],
      mixedBlocks: [],
    };

    const filter = [
      {
        AND: [
          { restaurant: '5f10131484fbb2003bf1b8fb', publications_in: ['NewsFeed', 'Events'] },
          {
            OR: [
              { journal_exists: false, toProfessionals_exists: false },
              { journal_in: ['', null], toProfessionals_in: ['', null] },
            ],
          },
        ],
      },
    ];

    const notCreateObjectId = true;
    const { where } = mergeWhereAndFilter(filter, {}, postConfig, notCreateObjectId);

    const query = new mingo.Query(where);
    const result = query.test(data);

    const expectedResult = true;

    expect(result).toBe(expectedResult);
  });
});
