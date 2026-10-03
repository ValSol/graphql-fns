import type { LookupMongoDB, NearForAggregateMongodb } from '@/tsTypes';

import composeAggregateHead from './composeAggregateHead';

const lookups: LookupMongoDB[] = [
  {
    $lookup: {
      from: 'section_things',
      localField: 'section',
      foreignField: '_id',
      as: 'section_',
    },
  },
];

const where = { show: { $eq: true }, 'section_.show': { $eq: true } };

const geoNear: NearForAggregateMongodb = {
  near: { type: 'Point', coordinates: [50.4, 30.5] },
  distanceField: 'position_distance',
  key: 'position.coordinates',
  spherical: true,
};

describe('composeAggregateHead', () => {
  test('puts the pre-match before the lookups', () => {
    const result = composeAggregateHead({ where, lookups });

    const expectedResult = [{ $match: { show: { $eq: true } } }, ...lookups, { $match: where }];

    expect(result).toEqual(expectedResult);
  });

  test('merges the pre-match into the "$text" match', () => {
    const result = composeAggregateHead({ where, lookups, search: 'abc', sortByTextScore: true });

    const expectedResult = [
      { $match: { $text: { $search: 'abc' }, show: { $eq: true } } },
      { $sort: { score: { $meta: 'textScore' } } },
      ...lookups,
      { $match: where },
    ];

    expect(result).toEqual(expectedResult);
  });

  test('doesn\'t sort by text score if not asked', () => {
    const result = composeAggregateHead({ where, lookups, search: 'abc' });

    const expectedResult = [
      { $match: { $text: { $search: 'abc' }, show: { $eq: true } } },
      ...lookups,
      { $match: where },
    ];

    expect(result).toEqual(expectedResult);
  });

  test('puts the pre-match into "$geoNear" query', () => {
    const result = composeAggregateHead({ where, lookups, geoNear });

    const expectedResult = [
      { $geoNear: { ...geoNear, query: { show: { $eq: true } } } },
      ...lookups,
      { $match: where },
    ];

    expect(result).toEqual(expectedResult);
  });

  test('adds no pre-match for a purely relational where', () => {
    const where2 = { 'section_.show': { $eq: true } };

    const result = composeAggregateHead({ where: where2, lookups, geoNear, search: 'abc' });

    const expectedResult = [
      { $match: { $text: { $search: 'abc' } } },
      { $geoNear: geoNear },
      ...lookups,
      { $match: where2 },
    ];

    expect(result).toEqual(expectedResult);
  });

  test('adds no pre-match without lookups', () => {
    const where2 = { show: { $eq: true } };

    const result = composeAggregateHead({ where: where2, lookups: [], search: 'abc' });

    const expectedResult = [{ $match: { $text: { $search: 'abc' } } }, { $match: where2 }];

    expect(result).toEqual(expectedResult);
  });

  test('adds no "$match" for an empty where', () => {
    const result = composeAggregateHead({ where: {}, lookups: [], geoNear });

    expect(result).toEqual([{ $geoNear: geoNear }]);
  });
});
