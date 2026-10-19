import { Types } from 'mongoose';

import type { TangibleEntityConfig } from '@/tsTypes';

import composeUniqueKeys from './composeUniqueKeys';

describe('composeUniqueKeys', () => {
  const entityConfig = {
    name: 'Person',
    type: 'tangible',
    uniqueCompoundIndexes: [['lastName', 'birthday']],
    textFields: [
      { name: 'email', unique: true, type: 'textFields' },
      { name: 'name', type: 'textFields' },
      { name: 'lastName', type: 'textFields' },
      { name: 'tags', unique: true, array: true, type: 'textFields' },
    ],
    intFields: [{ name: 'code', unique: true, type: 'intFields' }],
    dateTimeFields: [{ name: 'birthday', type: 'dateTimeFields' }],
    relationalFields: [
      { name: 'passport', unique: true, oppositeName: 'person', type: 'relationalFields' },
    ],
  } as unknown as TangibleEntityConfig;

  const passportId = new Types.ObjectId('5f85d2a8ac4bc4a3c6a2fa65');

  test('should compose keys of set unique fields only', () => {
    const keys = composeUniqueKeys({ email: 'ann@b.c', name: 'Ann', code: 7 }, entityConfig);

    expect(keys).toEqual([
      JSON.stringify(['email', 'value:ann@b.c']),
      JSON.stringify(['code', 'value:7']),
    ]);
  });

  test('should give the same key for "connect" by string id & by mongo id', () => {
    expect(composeUniqueKeys({ passport: { connect: passportId } }, entityConfig)).toEqual(
      composeUniqueKeys({ passport: { connect: passportId.toString() } }, entityConfig),
    );
  });

  test('should not compose key for "create" of linked entity & for array fields', () => {
    expect(
      composeUniqueKeys({ passport: { create: { number: '1' } }, tags: ['a'] }, entityConfig),
    ).toEqual([]);
  });

  test('should compose key of compound index with absent field as "null"', () => {
    const [key] = composeUniqueKeys({ lastName: 'Lee' }, entityConfig);

    expect(key).toBe(
      JSON.stringify([
        ['lastName', 'birthday'],
        ['value:Lee', null],
      ]),
    );
  });

  test('should compare dates (as "Date" or string) of compound index by time', () => {
    expect(
      composeUniqueKeys(
        { lastName: 'Lee', birthday: new Date('2000-01-02T00:00:00.000Z') },
        entityConfig,
      ),
    ).toEqual(
      composeUniqueKeys({ lastName: 'Lee', birthday: '2000-01-02T00:00:00.000Z' }, entityConfig),
    );
  });

  test('should not compose key of compound index without its fields', () => {
    expect(composeUniqueKeys({ name: 'Ann' }, entityConfig)).toEqual([]);
  });
});
