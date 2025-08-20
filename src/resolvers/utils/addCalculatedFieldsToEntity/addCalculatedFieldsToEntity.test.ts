/* eslint-env jest */

import type { TangibleEntityConfig } from '../../../tsTypes';

import addCalculatedFieldsToEntity from '.';

describe('addCalculatedFieldsToEntity', () => {
  const exampleConfig: TangibleEntityConfig = {
    name: 'Example',
    type: 'tangible',
    textFields: [
      {
        name: 'text1',
        type: 'textFields',
      },
      {
        name: 'text2',
        type: 'textFields',
      },
      {
        name: 'text3',
        type: 'textFields',
      },
    ],

    calculatedFields: [
      {
        name: 'text',
        calculatedType: 'textFields',
        type: 'calculatedFields',
        asyncFunc: async (args, { context }: any) => {
          const result = await context.id;
          return result;
        },
        fieldsToUseNames: ['text1', 'text2'],
        func: (args, { text1, text2 }: any, resolverArg, asyncFuncResult) =>
          `${text1} ${text2} ${asyncFuncResult}` as string,
        required: true,
      },

      {
        name: 'texts',
        calculatedType: 'textFields',
        type: 'calculatedFields',
        fieldsToUseNames: ['text2', 'text3'],
        func: (args, { text2, text3 }: any) => [text2, text3] as string[],
        array: true,
        required: true,
      },
    ],
  };

  const resolverArg = {
    parent: null,
    args: {},
    context: { id: Promise.resolve('12345') },
    info: { projection: { _id: 1 } as const, fieldArgs: {}, path: [] as [] },
    involvedFilters: { inputOutputEntity: [[]] as any },
  };

  test('shoud return {}', () => {
    const projection: Record<string, 1> = {};

    const infoEssence = { projection, fieldArgs: {}, path: [] as [] };

    const data = { id: '1', text1: 'text1', text2: 'text2', text3: 'text3' };

    const asyncResolverResults = { text: '12345' };

    const result = addCalculatedFieldsToEntity(
      data,
      infoEssence,
      asyncResolverResults,
      resolverArg,
      exampleConfig,
      0,
    );

    const expectedResult = {
      id: '1',
      text1: 'text1',
      text2: 'text2',
      text3: 'text3',
    };

    expect(result).toEqual(expectedResult);
  });

  test('shoud return { text: 1 }', () => {
    const projection: Record<string, 1> = { text1: 1 };

    const infoEssence = { projection, fieldArgs: {}, path: [] as [] };

    const data = { text1: 'text1' };

    const asyncResolverResults = { text: '12345' };

    const result = addCalculatedFieldsToEntity(
      data,
      infoEssence,
      asyncResolverResults,
      resolverArg,
      exampleConfig,
      0,
    );

    const expectedResult = { text1: 'text1' };

    expect(result).toEqual(expectedResult);
  });

  test('shoud return { texs: 1, text2: 1, text3: 1 }', () => {
    const projection: Record<string, 1> = { texts: 1 };

    const infoEssence = { projection, fieldArgs: {}, path: [] as [] };

    const data = { id: '1', text2: 'text2', text3: 'text3' };

    const asyncResolverResults = { text: '12345' };

    const result = addCalculatedFieldsToEntity(
      data,
      infoEssence,
      asyncResolverResults,
      resolverArg,
      exampleConfig,
      0,
    );

    const expectedResult = { id: '1', text2: 'text2', text3: 'text3', texts: ['text2', 'text3'] };

    expect(result).toEqual(expectedResult);
  });
});
