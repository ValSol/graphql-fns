/* eslint-env jest */

import type { EntityConfig } from '../../../tsTypes';

import toGlobalId from '../toGlobalId';
import whereToGlobalIds from '.';

describe('whereToGlobalIds', () => {
  const personConfig = {} as EntityConfig;
  const personCloneConfig = {} as EntityConfig;

  Object.assign(personConfig, {
    name: 'Person',
    type: 'tangible',
    textFields: [
      {
        name: 'firstName',
        required: true,
        type: 'textFields',
      },
      {
        name: 'lastName',
        type: 'textFields',
      },
    ],
    duplexFields: [
      {
        name: 'friends',
        oppositeName: 'friends',
        config: personConfig,
        array: true,
        required: true,
        type: 'duplexFields',
      },
      {
        name: 'enemies',
        oppositeName: 'enemies',
        array: true,
        config: personConfig,
        type: 'duplexFields',
      },
      {
        name: 'clone',
        oppositeName: 'original',
        config: personCloneConfig,
        unique: true,
        type: 'duplexFields',
      },
      {
        name: 'clones',
        array: true,
        oppositeName: 'oneOforiginals',
        config: personCloneConfig,
        type: 'duplexFields',
      },
    ],
  });

  Object.assign(personCloneConfig, {
    name: 'PersonClone',
    type: 'tangible',

    textFields: [
      {
        name: 'firstName',
        required: true,
        type: 'textFields',
      },

      {
        name: 'lastName',
        type: 'textFields',
      },
    ],

    duplexFields: [
      {
        name: 'original',
        oppositeName: 'clone',
        config: personConfig,
        required: true,
        type: 'duplexFields',
      },

      {
        name: 'oneOforiginals',
        oppositeName: 'clones',
        config: personConfig,
        type: 'duplexFields',
      },
    ],
  });
  test('check single id transform', async () => {
    const id = '1234567890';
    const whereOne = { id };

    const result = await whereToGlobalIds(whereOne, personConfig);

    const expectedResult = { id: toGlobalId(id, personConfig.name) };

    expect(result).toEqual(expectedResult);
  });

  test('check single id === undefined', async () => {
    const id = undefined;
    const whereOne = { id };

    const result = await whereToGlobalIds(whereOne, personConfig);

    const expectedResult = { id };

    expect(result).toEqual(expectedResult);
  });

  test('check single duplex field transform', async () => {
    const clone = '1234567890';
    const whereOne = { clone };

    const result = await whereToGlobalIds(whereOne, personConfig);

    const expectedResult = { clone: toGlobalId(clone, personCloneConfig.name) };

    expect(result).toEqual(expectedResult);
  });

  test('check single no id transform', async () => {
    const whereOne = { slug: 'abc' };

    const result = await whereToGlobalIds(whereOne, personConfig);

    const expectedResult = whereOne;

    expect(result).toEqual(expectedResult);
  });

  test('check array id transform', async () => {
    const id = '1234567890';
    const whereOne = [{ id }];

    const result = await whereToGlobalIds(whereOne, personConfig);

    const expectedResult = [{ id: toGlobalId(id, personConfig.name) }];

    expect(result).toEqual(expectedResult);
  });

  test('check array duplex field transform', async () => {
    const clone = '1234567890';
    const whereOne = [{ clone }];

    const result = await whereToGlobalIds(whereOne, personConfig);

    const expectedResult = [{ clone: toGlobalId(clone, personCloneConfig.name) }];

    expect(result).toEqual(expectedResult);
  });

  test('check array no id transform', async () => {
    const whereOne = [{ slug: 'abc' }];

    const result = await whereToGlobalIds(whereOne, personConfig);

    const expectedResult = whereOne;

    expect(result).toEqual(expectedResult);
  });
});
