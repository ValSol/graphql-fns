// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../../../flowTypes';

import toGlobalId from '../../toGlobalId';
import transformWhereOnes from './transformWhereOnes';

describe('transformWhereOnes', () => {
  const personConfig: ThingConfig = {};
  const personCloneConfig: ThingConfig = {};

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
    const id = '1234567890a';
    const whereOnes = { clone: { id: toGlobalId(id, 'PersonClone') } };

    const result = await transformWhereOnes(whereOnes, personConfig);

    const expectedResult = { clone: { id } };

    expect(result).toEqual(expectedResult);
  });

  test('check array id transform', async () => {
    const id = '1234567890a';
    const whereOnes = { clones: [{ id: toGlobalId(id, 'PersonClone') }] };

    const result = await transformWhereOnes(whereOnes, personConfig);

    const expectedResult = { clones: [{ id }] };

    expect(result).toEqual(expectedResult);
  });

  test('check array single id transform', async () => {
    const id = '1234567890a';
    const whereOnes = [{ clone: { id: toGlobalId(id, 'PersonClone') } }];

    const result = await transformWhereOnes(whereOnes, personConfig);

    const expectedResult = [{ clone: { id } }];

    expect(result).toEqual(expectedResult);
  });

  test('check array of array id transform', async () => {
    const id = '1234567890a';
    const whereOnes = [{ clones: [{ id: toGlobalId(id, 'PersonClone') }] }];

    const result = await transformWhereOnes(whereOnes, personConfig);

    const expectedResult = [{ clones: [{ id }] }];

    expect(result).toEqual(expectedResult);
  });

  test('check single no id transform', async () => {
    const whereOnes = { clone: { slug: 'abc' } };

    const result = await transformWhereOnes(whereOnes, personConfig);

    const expectedResult = whereOnes;

    expect(result).toEqual(expectedResult);
  });

  test('check array no id transform', async () => {
    const whereOnes = { clones: [{ slug: 'abc' }] };

    const result = await transformWhereOnes(whereOnes, personConfig);

    const expectedResult = whereOnes;

    expect(result).toEqual(expectedResult);
  });
});
