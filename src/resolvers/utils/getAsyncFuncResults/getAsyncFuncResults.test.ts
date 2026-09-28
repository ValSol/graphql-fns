import type { ResolverCreatorArg, ServersideConfig, TangibleEntityConfig } from '@/tsTypes';

import getAsyncFuncResults from '.';

describe('getAsyncFuncResults', () => {
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
      },
    },
  };

  const resolverArg = {
    parent: null,
    args: {},
    context: { id: Promise.resolve('12345') },
    info: { projection: { _id: 1 } as const, fieldArgs: {}, path: [] as [] },
    resolverOptions: { involvedFilters: { inputOutputFilterAndLimit: [[]] as any } },
  };

  test('shoud return "12345"', async () => {
    const projection: Record<string, 1> = { text: 1 };

    const infoEssence = { projection, fieldArgs: {}, path: [] as [] };

    const result = await getAsyncFuncResults(
      infoEssence,
      {
        entityConfig: exampleConfig,
        generalConfig: { allEntityConfigs: { Example: exampleConfig } },
        serversideConfig,
      } as ResolverCreatorArg,
      resolverArg,
      [], // notAsyncCalculatedFieldValues
    );

    const expectedResult = { text: '12345' };

    expect(result).toEqual(expectedResult);
  });
});
