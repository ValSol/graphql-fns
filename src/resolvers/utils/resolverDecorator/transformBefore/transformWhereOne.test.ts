/* eslint-env jest */

import type { EntityConfig } from '../../../../tsTypes';

import toGlobalId from '../../toGlobalId';
import transformWhereOne from './transformWhereOne';

describe('transformWhereOne', () => {
  const personConfig = {} as EntityConfig;
  const personCloneConfig = {} as EntityConfig;

  Object.assign(personConfig, {
    name: 'Person',
    type: 'tangible',
    textFields: [
      {
        name: 'firstName',
        required: true,
      },
      {
        name: 'lastName',
      },
    ],
    duplexFields: [
      {
        name: 'friends',
        oppositeName: 'friends',
        config: personConfig,
        array: true,
        required: true,
      },
      {
        name: 'enemies',
        oppositeName: 'enemies',
        array: true,
        config: personConfig,
      },
      {
        name: 'clone',
        oppositeName: 'original',
        config: personCloneConfig,
        unique: true,
      },
      {
        name: 'clones',
        array: true,
        oppositeName: 'oneOforiginals',
        config: personCloneConfig,
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
      },

      {
        name: 'lastName',
      },
    ],

    duplexFields: [
      {
        name: 'original',
        oppositeName: 'clone',
        config: personConfig,
        required: true,
      },

      {
        name: 'oneOforiginals',
        oppositeName: 'clones',
        config: personConfig,
      },
    ],
  });
  test('check single id transform', async () => {
    const id = '1234567890';
    const whereOne = { id: toGlobalId(id, 'entityName') };

    const result = await transformWhereOne(whereOne, personConfig);

    const expectedResult = { id };

    expect(result).toEqual(expectedResult);
  });

  test('check single id === undefined', async () => {
    const id = undefined;
    const whereOne = { id: undefined };

    const result = await transformWhereOne(whereOne, personConfig);

    const expectedResult = { id };

    expect(result).toEqual(expectedResult);
  });

  test('check single duplex field transform', async () => {
    const clone = '1234567890';
    const whereOne = { clone: toGlobalId(clone, 'entityName') };

    const result = await transformWhereOne(whereOne, personConfig);

    const expectedResult = { clone };

    expect(result).toEqual(expectedResult);
  });

  test('check single no id transform', async () => {
    const whereOne = { slug: 'abc' };

    const result = await transformWhereOne(whereOne, personConfig);

    const expectedResult = whereOne;

    expect(result).toEqual(expectedResult);
  });

  test('check array id transform', async () => {
    const id = '1234567890';
    const whereOne = [{ id: toGlobalId(id, 'entityName') }];

    const result = await transformWhereOne(whereOne, personConfig);

    const expectedResult = [{ id }];

    expect(result).toEqual(expectedResult);
  });

  test('check array duplex field transform', async () => {
    const clone = '1234567890';
    const whereOne = [{ clone: toGlobalId(clone, 'entityName') }];

    const result = await transformWhereOne(whereOne, personConfig);

    const expectedResult = [{ clone }];

    expect(result).toEqual(expectedResult);
  });

  test('check array no id transform', async () => {
    const whereOne = [{ slug: 'abc' }];

    const result = await transformWhereOne(whereOne, personConfig);

    const expectedResult = whereOne;

    expect(result).toEqual(expectedResult);
  });
});
