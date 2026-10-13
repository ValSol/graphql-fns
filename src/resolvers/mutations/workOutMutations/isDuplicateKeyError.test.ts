import { MongoBulkWriteError, MongoServerError } from 'mongodb';

import isDuplicateKeyError from './isDuplicateKeyError';

describe('isDuplicateKeyError', () => {
  test('should detect duplicate key error', () => {
    const error = new MongoServerError({ message: 'E11000 duplicate key error', code: 11000 });

    expect(isDuplicateKeyError(error)).toBe(true);
    expect(isDuplicateKeyError({ code: 11001 })).toBe(true);
  });

  test('should detect duplicate key error in errors of bulk write', () => {
    const error = new MongoBulkWriteError(
      { message: 'bulk write failed', code: 65, writeErrors: [] } as any,
      {} as any,
    );

    Object.defineProperty(error, 'writeErrors', { value: [{ code: 11000 }] });

    expect(isDuplicateKeyError(error)).toBe(true);
    expect(isDuplicateKeyError({ code: 65, writeErrors: [{ code: 121 }] })).toBe(false);
  });

  test('should not detect other errors', () => {
    expect(isDuplicateKeyError(new MongoServerError({ message: 'conflict', code: 112 }))).toBe(
      false,
    );
    expect(isDuplicateKeyError(new TypeError('Wrong data'))).toBe(false);
    expect(isDuplicateKeyError(null)).toBe(false);
    expect(isDuplicateKeyError('E11000')).toBe(false);
  });
});
