/* eslint-env jest */

import mingo from 'mingo';

import type { EntityConfig } from '../../../tsTypes';

import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';

describe('patchExternalReferences util', () => {
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

    textFields: [
      {
        name: 'slug',
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
