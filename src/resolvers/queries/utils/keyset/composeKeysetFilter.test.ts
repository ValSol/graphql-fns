import mongoose from 'mongoose';

import composeKeysetFilter from './composeKeysetFilter';
import composeKeysetSortKeys, { type KeysetSortKey } from './composeKeysetSortKeys';

describe('composeKeysetSortKeys', () => {
  test('should compose keys up to "id"', () => {
    expect(composeKeysetSortKeys(['group_ASC', 'id_DESC', 'label_ASC'])).toEqual([
      ['group', 1],
      ['_id', -1],
    ]);
  });

  test('should throw an error for keys without "id"', () => {
    expect(() => composeKeysetSortKeys(['group_ASC'])).toThrow(TypeError);
  });
});

describe('composeKeysetFilter', () => {
  const id = new mongoose.Types.ObjectId();

  test('should compose a filter for "id" only', () => {
    expect(composeKeysetFilter([['_id', 1]], [id], 'after')).toEqual({ _id: { $gt: id } });
    expect(composeKeysetFilter([['_id', 1]], [id], 'before')).toEqual({ _id: { $lt: id } });
    expect(composeKeysetFilter([['_id', -1]], [id], 'after', true)).toEqual({
      _id: { $lte: id },
    });
  });

  test('should compose a filter "after" for ASC keys', () => {
    const keys: KeysetSortKey[] = [
      ['group', 1],
      ['_id', 1],
    ];

    expect(composeKeysetFilter(keys, [5, id], 'after')).toEqual({
      $and: [
        { group: { $gte: 5 } },
        { $or: [{ group: { $gt: 5 } }, { $and: [{ group: 5 }, { _id: { $gt: id } }] }] },
      ],
    });
  });

  test('should compose a filter "after" for DESC keys', () => {
    const keys: KeysetSortKey[] = [
      ['group', -1],
      ['_id', -1],
    ];

    expect(composeKeysetFilter(keys, [5, id], 'after')).toEqual({
      $and: [
        { $or: [{ group: { $lte: 5 } }, { group: null }] },
        {
          $or: [
            { $or: [{ group: { $lt: 5 } }, { group: null }] },
            { $and: [{ group: 5 }, { _id: { $lt: id } }] },
          ],
        },
      ],
    });
  });

  test('should compose filters for a null value', () => {
    const keys: KeysetSortKey[] = [
      ['group', 1],
      ['_id', 1],
    ];

    // null comes first: all not null values come after it
    expect(composeKeysetFilter(keys, [null, id], 'after')).toEqual({
      $or: [{ group: { $ne: null } }, { $and: [{ group: null }, { _id: { $gt: id } }] }],
    });

    // only null values come before null
    expect(composeKeysetFilter(keys, [null, id], 'before')).toEqual({
      $and: [{ group: null }, { $and: [{ group: null }, { _id: { $lt: id } }] }],
    });

    expect(composeKeysetFilter(keys, [null, id], 'before', true)).toEqual({
      $and: [{ group: null }, { $and: [{ group: null }, { _id: { $lte: id } }] }],
    });
  });

  test('should compose a filter for several keys', () => {
    const date = new Date('2026-01-01T00:00:00Z');

    const keys: KeysetSortKey[] = [
      ['group', 1],
      ['createdAt', -1],
      ['_id', -1],
    ];

    expect(composeKeysetFilter(keys, [5, date, id], 'before')).toEqual({
      $and: [
        { $or: [{ group: { $lte: 5 } }, { group: null }] },
        {
          $or: [
            { $or: [{ group: { $lt: 5 } }, { group: null }] },
            { $and: [{ group: 5 }, { createdAt: { $gt: date } }] },
            { $and: [{ group: 5 }, { createdAt: date }, { _id: { $gt: id } }] },
          ],
        },
      ],
    });
  });
});
