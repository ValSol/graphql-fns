import type { TangibleEntityConfig } from '@/tsTypes';

import checkWhereOneArgs from '.';

describe('checkWhereOneArgs', () => {
  const entityConfig: TangibleEntityConfig = {
    name: 'Person',
    type: 'tangible',
    textFields: [
      { name: 'email', unique: true, type: 'textFields' },
      { name: 'firstName', type: 'textFields' },
      { name: 'lastName', type: 'textFields' },
    ],
    uniqueCompoundIndexes: [['firstName', 'lastName']],
  };

  test('should accept "whereOne" with exactly one key', () => {
    expect(() => checkWhereOneArgs({ email: 'a@b.c' }, undefined, entityConfig)).not.toThrow();
  });

  test('should throw on "whereOne" with not one key', () => {
    expect(() => checkWhereOneArgs({ id: '1', email: 'a@b.c' }, undefined, entityConfig)).toThrow(
      'Expected exactly one key in whereOne arg!',
    );

    expect(() => checkWhereOneArgs({}, undefined, entityConfig)).toThrow(
      'Expected exactly one key in whereOne arg!',
    );
  });

  test('should throw on both or none of args', () => {
    expect(() =>
      checkWhereOneArgs({ email: 'a@b.c' }, { firstName: 'A', lastName: 'B' }, entityConfig),
    ).toThrow('Expected exactly one input from "whereCompoundOne" && "whereOne"!');

    expect(() => checkWhereOneArgs(undefined, undefined, entityConfig)).toThrow(
      'Expected "whereCompoundOne" or "whereOne" input!',
    );
  });

  test('should check "whereCompoundOne" keys by "uniqueCompoundIndexes"', () => {
    expect(() =>
      checkWhereOneArgs(undefined, { firstName: 'A', lastName: null }, entityConfig),
    ).not.toThrow();

    expect(() => checkWhereOneArgs(undefined, { firstName: 'A' }, entityConfig)).toThrow(
      'Got "whereCompoundOne" keys: ["firstName"] of "Person" entity that not equal to fields of any of "uniqueCompoundIndexes": [["firstName","lastName"]]!',
    );
  });
});
