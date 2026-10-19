import { Types } from 'mongoose';

import matchWhere from './matchWhere';

describe('matchWhere', () => {
  const id = new Types.ObjectId('5f85d2a8ac4bc4a3c6a2fa65');
  const friendId = new Types.ObjectId('5f85d2a8ac4bc4a3c6a2fa66');
  const birthday = new Date('2000-01-02T03:04:05.000Z');

  const entity = {
    _id: id,
    email: 'ann@b.c',
    code: 7,
    rate: 1.5,
    friend: friendId,
    birthday,
    tags: ['a', 'b'],
  };

  test('should compare "id" with "_id"', () => {
    expect(matchWhere(entity, { id: id.toString() })).toBe(true);
    expect(matchWhere(entity, { id })).toBe(true);
    expect(matchWhere(entity, { id: friendId.toString() })).toBe(false);
  });

  test('should compare text & numbers', () => {
    expect(matchWhere(entity, { email: 'ann@b.c' })).toBe(true);
    expect(matchWhere(entity, { email: 'Ann@b.c' })).toBe(false);
    expect(matchWhere(entity, { code: 7 })).toBe(true);
    expect(matchWhere(entity, { code: 8 })).toBe(false);
    expect(matchWhere(entity, { rate: 1.5 })).toBe(true);
  });

  test('should compare ids of relational fields as strings', () => {
    expect(matchWhere(entity, { friend: friendId.toString() })).toBe(true);
    expect(matchWhere(entity, { friend: id.toString() })).toBe(false);
  });

  test('should compare dates by time', () => {
    expect(matchWhere(entity, { birthday: '2000-01-02T03:04:05.000Z' })).toBe(true);
    expect(matchWhere(entity, { birthday: new Date(birthday.getTime()) })).toBe(true);
    expect(matchWhere(entity, { birthday: '2000-01-02T03:04:06.000Z' })).toBe(false);
  });

  test('should match all fields of "whereCompoundOne"', () => {
    expect(matchWhere(entity, { email: 'ann@b.c', friend: friendId.toString() })).toBe(true);
    expect(matchWhere(entity, { email: 'ann@b.c', friend: id.toString() })).toBe(false);
  });

  test('should match "null" with absent or "null" field only', () => {
    expect(matchWhere(entity, { email: 'ann@b.c', nickname: null })).toBe(true);
    expect(matchWhere({ ...entity, nickname: null }, { nickname: null })).toBe(true);
    expect(matchWhere(entity, { email: null })).toBe(false);
    expect(matchWhere(entity, { nickname: 'Ann' })).toBe(false);
  });

  test('should match value contained in array field', () => {
    expect(matchWhere(entity, { tags: 'b' })).toBe(true);
    expect(matchWhere(entity, { tags: 'c' })).toBe(false);
  });
});
