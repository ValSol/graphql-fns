import mongoose from 'mongoose';
import deepEqual from 'fast-deep-equal';

import type { KeysetSortKey } from './composeKeysetSortKeys';

const {
  BSON: { EJSON, ObjectId },
} = mongoose.mongo;

// values of the sort keys of the entity; null for a missing value (MongoDB sorts them as null)
export const getKeysetValues = (entity: Record<string, any>, keys: KeysetSortKey[]): unknown[] =>
  keys.map(([fieldName]) => {
    if (fieldName === '_id') return new ObjectId(entity.id.toString());

    const value = entity[fieldName];

    return value === undefined ? null : value;
  });

// EJSON keeps the types of Date & ObjectId values; "sortBy" binds the cursor to the order
export const toKeysetCursor = (sortBy: string[], values: unknown[]): string =>
  Buffer.from(EJSON.stringify({ sortBy, values }), 'utf8').toString('base64');

// a value of a cursor gets into a filter so it must not be an object with query operators
const isAllowedValue = (value: unknown): boolean =>
  value === null ||
  ['string', 'number', 'boolean'].includes(typeof value) ||
  value instanceof Date ||
  value instanceof ObjectId;

// returns null for a cursor that is malformed or composed for another sort
export const fromKeysetCursor = (
  cursor: string,
  sortBy: string[],
  keys: KeysetSortKey[],
): null | unknown[] => {
  let parsed: any;

  try {
    parsed = EJSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
  } catch {
    return null;
  }

  if (!parsed || !deepEqual(parsed.sortBy, sortBy) || !Array.isArray(parsed.values)) return null;

  const { values } = parsed as { values: unknown[] };

  if (
    values.length !== keys.length ||
    !values.every(isAllowedValue) ||
    !(values[values.length - 1] instanceof ObjectId)
  ) {
    return null;
  }

  return values;
};
