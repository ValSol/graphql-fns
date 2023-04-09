/* eslint-env jest */

import type { InvolvedFilter, TangibleEntityConfig } from '../../../../tsTypes';

import toGlobalId from '../../toGlobalId';
import transformWhereOnes from './transformWhereOnes';

describe('transformWhereOnes', () => {
  const personConfig = {} as TangibleEntityConfig;
  const personCloneConfig = {} as TangibleEntityConfig;

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
    const id = '1234567890a';
    const whereOnes = { clone: { id: toGlobalId(id, 'PersonClone') } };

    const result = await transformWhereOnes(whereOnes, personConfig);

    const expectedResult = { clone: { id } };

    expect(result).toEqual(expectedResult);
  });

  test('check array id transform', async () => {
    const id = '1234567890a';
    const whereOnes = {
      clones: [{ id: toGlobalId(id, 'PersonClone') }],
    };

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
