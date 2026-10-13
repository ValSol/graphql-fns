import type { TangibleEntityConfig } from '@/tsTypes';

import composeDataToCreate from './composeDataToCreate';

describe('composeDataToCreate', () => {
  const placeConfig = {} as TangibleEntityConfig;

  const personConfig: TangibleEntityConfig = {
    name: 'Person',
    type: 'tangible',
    textFields: [
      { name: 'email', unique: true, type: 'textFields' },
      { name: 'name', type: 'textFields' },
      { name: 'tags', array: true, unique: true, type: 'textFields' },
    ],
    intFields: [{ name: 'code', unique: true, type: 'intFields' }],
    dateTimeFields: [{ name: 'birthday', type: 'dateTimeFields' }],
    relationalFields: [
      {
        name: 'country',
        oppositeName: 'countryOf',
        unique: true,
        config: placeConfig,
        type: 'relationalFields',
      },
      {
        name: 'visited',
        oppositeName: 'visitedBy',
        array: true,
        config: placeConfig,
        type: 'relationalFields',
      },
    ],
    duplexFields: [
      {
        name: 'location',
        oppositeName: 'citizens',
        config: placeConfig,
        type: 'duplexFields',
      },
    ],
    uniqueCompoundIndexes: [
      ['name', 'birthday'],
      ['name', 'location'],
    ],
  };

  Object.assign(placeConfig, {
    name: 'Place',
    type: 'tangible',
    textFields: [{ name: 'title', type: 'textFields' }],
    duplexFields: [
      {
        name: 'citizens',
        oppositeName: 'location',
        array: true,
        config: personConfig,
        type: 'duplexFields',
      },
    ],
  });

  test('should add scalar field of "whereOne" to "data"', () => {
    const result = composeDataToCreate(
      { whereOne: { email: 'a@b.c' }, data: { name: 'Ann' } },
      personConfig,
    );

    expect(result).toEqual({ email: 'a@b.c', name: 'Ann' });
  });

  test('should not change "data" that has the same value', () => {
    const data = { email: 'a@b.c', name: 'Ann' };

    const result = composeDataToCreate({ whereOne: { email: 'a@b.c' }, data }, personConfig);

    expect(result).toEqual(data);
    expect(result).not.toBe(data);
  });

  test('should compare numbers & strings by value', () => {
    expect(composeDataToCreate({ whereOne: { code: 7 }, data: { code: 7 } }, personConfig)).toEqual(
      { code: 7 },
    );
  });

  test('should throw on conflicting scalar value', () => {
    expect(() =>
      composeDataToCreate({ whereOne: { email: 'a@b.c' }, data: { email: 'x@y.z' } }, personConfig),
    ).toThrow('Value of field "email" in "data" arg conflicts with "whereOne" arg: "a@b.c"!');
  });

  test('should not transfer "id"', () => {
    expect(
      composeDataToCreate({ whereOne: { id: '1' }, data: { name: 'Ann' } }, personConfig),
    ).toEqual({ name: 'Ann' });
  });

  test('should transfer relational & duplex fields as "connect"', () => {
    expect(composeDataToCreate({ whereOne: { country: 'p1' }, data: {} }, personConfig)).toEqual({
      country: { connect: 'p1' },
    });

    expect(
      composeDataToCreate(
        { whereCompoundOne: { name: 'Ann', location: 'p2' }, data: {} },
        personConfig,
      ),
    ).toEqual({ name: 'Ann', location: { connect: 'p2' } });
  });

  test('should accept the same "connect" & throw on other "connect" or "create"', () => {
    expect(
      composeDataToCreate(
        { whereOne: { country: 'p1' }, data: { country: { connect: 'p1' } } },
        personConfig,
      ),
    ).toEqual({ country: { connect: 'p1' } });

    expect(() =>
      composeDataToCreate(
        { whereOne: { country: 'p1' }, data: { country: { connect: 'p2' } } },
        personConfig,
      ),
    ).toThrow('Value of field "country" in "data" arg conflicts with "whereOne" arg: "p1"!');

    expect(() =>
      composeDataToCreate(
        { whereOne: { country: 'p1' }, data: { country: { create: { title: 'New' } } } },
        personConfig,
      ),
    ).toThrow('conflicts with "whereOne" arg');
  });

  test('should use array for array fields', () => {
    expect(composeDataToCreate({ whereOne: { tags: 'a' }, data: {} }, personConfig)).toEqual({
      tags: ['a'],
    });

    expect(
      composeDataToCreate({ whereOne: { tags: 'a' }, data: { tags: ['b', 'a'] } }, personConfig),
    ).toEqual({ tags: ['b', 'a'] });

    expect(() =>
      composeDataToCreate({ whereOne: { tags: 'a' }, data: { tags: ['b'] } }, personConfig),
    ).toThrow('Value of field "tags" in "data" arg conflicts with "whereOne" arg: "a"!');
  });

  test('should compare dateTime values as dates', () => {
    const result = composeDataToCreate(
      {
        whereCompoundOne: { name: 'Ann', birthday: '2020-01-01T00:00:00.000Z' },
        data: { birthday: new Date('2020-01-01T00:00:00.000Z') as any },
      },
      personConfig,
    );

    expect(result).toEqual({ name: 'Ann', birthday: new Date('2020-01-01T00:00:00.000Z') });

    expect(() =>
      composeDataToCreate(
        {
          whereCompoundOne: { name: 'Ann', birthday: '2020-01-01T00:00:00.000Z' },
          data: { birthday: '2021-01-01T00:00:00.000Z' },
        },
        personConfig,
      ),
    ).toThrow('Value of field "birthday" in "data" arg conflicts with "whereCompoundOne" arg');
  });

  test('should accept "null" value only if field is absent in "data"', () => {
    expect(
      composeDataToCreate(
        { whereCompoundOne: { name: 'Ann', birthday: null }, data: {} },
        personConfig,
      ),
    ).toEqual({ name: 'Ann' });

    expect(() =>
      composeDataToCreate(
        { whereCompoundOne: { name: 'Ann', birthday: null }, data: { birthday: '2020-01-01' } },
        personConfig,
      ),
    ).toThrow(
      'Value of field "birthday" in "data" arg conflicts with "whereCompoundOne" arg: null!',
    );
  });

  test('should throw on unknown field', () => {
    expect(() => composeDataToCreate({ whereOne: { unknown: 1 }, data: {} }, personConfig)).toThrow(
      'Not found field "unknown" of "whereOne" arg in "Person"!',
    );
  });
});
