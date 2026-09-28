import type { ResolverCreatorArg, ServersideConfig, TangibleEntityConfig } from '@/tsTypes';

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
        async: true,
        required: true,
      },

      {
        name: 'texts',
        calculatedType: 'textFields',
        type: 'calculatedFields',
        array: true,
        required: true,
      },
    ],
  };

  const serversideConfig: ServersideConfig = {
    calculatedFields: {
      Example: {
        text: {
          asyncFunc: async (args, resolverCreatorArg, { context }: any) => context.id,
          fieldsToUseNames: ['text1', 'text2'],
          func: (args, { text1, text2 }, resolverArg, asyncFuncResult) =>
            `${text1} ${text2} ${asyncFuncResult}`,
        },
        texts: {
          fieldsToUseNames: ['text2', 'text3'],
          func: (args, { text2, text3 }) => [text2, text3],
        },
      },
    },
  };

  const resolverCreatorArg: ResolverCreatorArg = {
    entityConfig: exampleConfig,
    generalConfig: { allEntityConfigs: { Example: exampleConfig } },
    serversideConfig,
  };

  const resolverArg = {
    parent: null,
    args: {},
    context: { id: Promise.resolve('12345') },
    info: { projection: { _id: 1 } as const, fieldArgs: {}, path: [] as [] },
    resolverOptions: { involvedFilters: { inputOutputFilterAndLimit: [[]] as any } },
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
      resolverCreatorArg,
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
      resolverCreatorArg,
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
      resolverCreatorArg,
      0,
    );

    const expectedResult = { id: '1', text2: 'text2', text3: 'text3', texts: ['text2', 'text3'] };

    expect(result).toEqual(expectedResult);
  });
});
