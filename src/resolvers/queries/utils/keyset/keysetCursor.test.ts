import mongoose from 'mongoose';

import composeKeysetSortKeys from './composeKeysetSortKeys';
import { fromKeysetCursor, getKeysetValues, toKeysetCursor } from './keysetCursor';

describe('keysetCursor', () => {
  const sortBy = ['createdAt_DESC', 'label_ASC', 'group_ASC', 'id_ASC'];
  const keys = composeKeysetSortKeys(sortBy);

  const id = new mongoose.Types.ObjectId();
  const createdAt = new Date('2026-01-01T00:00:00Z');

  test('should restore the values of the entity', () => {
    const values = getKeysetValues({ id, createdAt, label: 'Київ' }, keys);

    expect(values).toEqual([createdAt, 'Київ', null, id]);

    const result = fromKeysetCursor(toKeysetCursor(sortBy, values), sortBy, keys);

    expect(result).toEqual(values);
    expect((result as unknown[])[0]).toBeInstanceOf(Date);
    expect((result as unknown[])[3]).toBeInstanceOf(mongoose.Types.ObjectId);
  });

  test('should return null for a cursor of another sort', () => {
    const cursor = toKeysetCursor(sortBy, [createdAt, 'a', 1, id]);

    const sortBy2 = ['label_ASC', 'id_ASC'];

    expect(fromKeysetCursor(cursor, sortBy2, composeKeysetSortKeys(sortBy2))).toBeNull();
  });

  test('should return null for a malformed cursor', () => {
    const toBase64 = (text: string) => Buffer.from(text, 'utf8').toString('base64');

    [
      'not a cursor',
      toBase64(`${id.toString()}:5`),
      toBase64(JSON.stringify({ sortBy, values: [null, 'a', 1] })),
      toBase64(JSON.stringify({ sortBy, values: [null, 'a', 1, id.toString()] })),
      // a value must not get operators into the filter
      toBase64(
        JSON.stringify({ sortBy, values: [{ $ne: null }, 'a', 1, { $oid: id.toString() }] }),
      ),
    ].forEach((cursor) => expect(fromKeysetCursor(cursor, sortBy, keys)).toBeNull());
  });
});
