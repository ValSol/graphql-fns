import { Types } from 'mongoose';

import type { LookupMongoDB } from '@/tsTypes';

import composePreMatch from './composePreMatch';

const composeLookup = (fieldName: string): LookupMongoDB => ({
  $lookup: {
    from: `${fieldName}_things`,
    localField: fieldName,
    foreignField: '_id',
    as: `${fieldName}_`,
  },
});

const lookups = [composeLookup('section'), composeLookup('group'), composeLookup('company')];

describe('composePreMatch', () => {
  test('hoists the local conditions common to every "$or" branch', () => {
    const areaId = new Types.ObjectId();

    const common = {
      areaId: { $eq: new Types.ObjectId(areaId.toString()) },
      closedAt: { $exists: false },
      show: { $eq: true },
    };

    const where = {
      $or: [
        { ...common, editors: { $not: { $size: 0 } } },
        { ...common, owners: { $not: { $size: 0 } } },
        {
          ...common,
          section: { $exists: true },
          'section_.editors': { $not: { $size: 0 } },
        },
        { ...common, section: { $exists: true }, 'section_.owners': { $not: { $size: 0 } } },
        { ...common, group: { $exists: true }, 'group_.editors': { $not: { $size: 0 } } },
        { ...common, group: { $exists: true }, 'group_.owners': { $not: { $size: 0 } } },
        { ...common, company: { $exists: true }, 'company_.editors': { $not: { $size: 0 } } },
        { ...common, company: { $exists: true }, 'company_.owners': { $not: { $size: 0 } } },
      ],
    };

    const result = composePreMatch(where, lookups);

    const expectedResult = {
      areaId: { $eq: areaId },
      closedAt: { $exists: false },
      show: { $eq: true },
      $or: [
        { editors: { $not: { $size: 0 } } },
        { owners: { $not: { $size: 0 } } },
        { section: { $exists: true } },
        { group: { $exists: true } },
        { company: { $exists: true } },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('gives nothing for an "$or" with a purely relational branch', () => {
    const where = {
      $or: [{ show: { $eq: true } }, { 'section_.show': { $eq: true } }],
    };

    const result = composePreMatch(where, lookups);

    expect(result).toBeNull();
  });

  test('keeps the local conditions next to such "$or"', () => {
    const where = {
      show: { $eq: true },
      $or: [{ title: { $eq: 'A' } }, { 'section_.show': { $eq: true } }],
    };

    const result = composePreMatch(where, lookups);

    expect(result).toEqual({ show: { $eq: true } });
  });

  test('gives "$or" of the local parts of branches with nothing in common', () => {
    const where = {
      $or: [
        { title: { $eq: 'A' }, 'section_.show': { $eq: true } },
        { slug: { $eq: 'b' }, 'group_.show': { $eq: true } },
      ],
    };

    const result = composePreMatch(where, lookups);

    expect(result).toEqual({ $or: [{ title: { $eq: 'A' } }, { slug: { $eq: 'b' } }] });
  });

  test('drops "$or" when hoisting leaves a branch empty', () => {
    const where = {
      $or: [
        { show: { $eq: true } },
        { show: { $eq: true }, title: { $eq: 'A' }, 'section_.show': { $eq: true } },
      ],
    };

    const result = composePreMatch(where, lookups);

    expect(result).toEqual({ show: { $eq: true } });
  });

  test('doesn\'t hoist conditions with the same key but different values', () => {
    const where = {
      $or: [
        { show: { $eq: true }, 'section_.show': { $eq: true } },
        { show: { $eq: false }, 'group_.show': { $eq: true } },
      ],
    };

    const result = composePreMatch(where, lookups);

    expect(result).toEqual({ $or: [{ show: { $eq: true } }, { show: { $eq: false } }] });
  });

  test('processes nested "$and" & "$or"', () => {
    const where = {
      $and: [
        {
          $or: [
            { title: { $eq: 'A' }, 'section_.show': { $eq: true } },
            { title: { $eq: 'A' }, slug: { $eq: 'b' } },
          ],
        },
        { 'group_.show': { $eq: true } },
        {
          $and: [{ counter: { $gt: 1 } }, { 'company_.counter': { $gt: 2 } }],
        },
      ],
    };

    const result = composePreMatch(where, lookups);

    const expectedResult = {
      $and: [{ title: { $eq: 'A' } }, { $and: [{ counter: { $gt: 1 } }] }],
    };

    expect(result).toEqual(expectedResult);
  });

  test('keeps a hoisted condition that conflicts with a top-level one', () => {
    const where = {
      counter: { $gt: 1 },
      $or: [
        { counter: { $lt: 10 }, 'section_.show': { $eq: true } },
        { counter: { $lt: 10 }, 'group_.show': { $eq: true } },
      ],
    };

    const result = composePreMatch(where, lookups);

    expect(result).toEqual({ counter: { $gt: 1 }, $and: [{ counter: { $lt: 10 } }] });
  });

  test('drops the whole "$nor" over a relational path', () => {
    const where = {
      show: { $eq: true },
      $nor: [{ title: { $eq: 'A' } }, { 'section_.show': { $eq: true } }],
    };

    const result = composePreMatch(where, lookups);

    expect(result).toEqual({ show: { $eq: true } });
  });

  test('drops the whole "$nor" with a relational path nested in "$or"', () => {
    const where = {
      $nor: [{ $or: [{ title: { $eq: 'A' } }, { 'section_.show': { $eq: true } }] }],
    };

    const result = composePreMatch(where, lookups);

    expect(result).toBeNull();
  });

  test('keeps a local "$nor"', () => {
    const where = {
      'section_.show': { $eq: true },
      $nor: [{ title: { $eq: 'A' } }, { slug: { $eq: 'b' } }],
    };

    const result = composePreMatch(where, lookups);

    expect(result).toEqual({ $nor: [{ title: { $eq: 'A' } }, { slug: { $eq: 'b' } }] });
  });

  test('drops a negating operator on a relational path', () => {
    const where = {
      show: { $ne: false },
      'section_.show': { $ne: false },
      'group_.tags': { $nin: ['a'] },
    };

    const result = composePreMatch(where, lookups);

    expect(result).toEqual({ show: { $ne: false } });
  });

  test('compares whole path segments with lookup fields', () => {
    const where = {
      section: { $exists: true },
      'section.title': { $eq: 'A' },
      section_: { $size: 1 },
      'section_.title': { $eq: 'A' },
    };

    const result = composePreMatch(where, lookups);

    expect(result).toEqual({ section: { $exists: true }, 'section.title': { $eq: 'A' } });
  });

  test('hoists equal "Date" values', () => {
    const where = {
      $or: [
        { createdAt: { $gt: new Date('2026-01-01') }, 'section_.show': { $eq: true } },
        { createdAt: { $gt: new Date('2026-01-01') }, 'group_.show': { $eq: true } },
      ],
    };

    const result = composePreMatch(where, lookups);

    expect(result).toEqual({ createdAt: { $gt: new Date('2026-01-01') } });
  });

  test('gives nothing without lookups', () => {
    const where = { show: { $eq: true } };

    const result = composePreMatch(where, []);

    expect(result).toBeNull();
  });

  test('gives nothing for a purely relational where', () => {
    const where = { 'section_.show': { $eq: true } };

    const result = composePreMatch(where, lookups);

    expect(result).toBeNull();
  });

  test('throws on an unknown operator', () => {
    const where = { $expr: { $eq: ['$a', '$b'] } };

    expect(() => composePreMatch(where, lookups)).toThrow('Got unknown operator "$expr"');
  });
});
