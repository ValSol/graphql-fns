/* eslint-env jest */

import type { TangibleEntityConfig } from '@/tsTypes';

import composeSubscriptionDummyEntityConfig from '.';

describe('composeSubscriptionDummyEntityConfig', () => {
  const entityConfig: TangibleEntityConfig = {
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
        fieldsToUseNames: ['text1'],
        func: ({ text1 }: any) => text1 as string,
        required: true,
      },

      {
        name: 'texts',
        calculatedType: 'textFields',
        type: 'calculatedFields',
        fieldsToUseNames: ['text2', 'text3'],
        func: ({ text2, text3 }) => [text2, text3] as string[],
        asyncFunc: async (args, { context }: any) => {
          const result = await context.id;
          return result;
        },
        array: true,
        required: true,
      },
    ],
  };

  test('allowedCalculatedWithAsyncFuncFieldNames: []', () => {
    const result = composeSubscriptionDummyEntityConfig(entityConfig);

    const expectedResult: TangibleEntityConfig = {
      name: 'DummyExample',
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
        {
          name: 'text',
          type: 'textFields',
        },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('allowedCalculatedWithAsyncFuncFieldNames: ["texts"]', () => {
    const allowedCalculatedWithAsyncFuncFieldNames: string[] = ['texts'];

    const result = composeSubscriptionDummyEntityConfig({
      ...entityConfig,
      allowedCalculatedWithAsyncFuncFieldNames,
    });

    const expectedResult: TangibleEntityConfig = {
      name: 'DummyExample',
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
        {
          name: 'text',
          type: 'textFields',
        },
        {
          name: 'texts',
          type: 'textFields',
          array: true,
        },
      ],
    };

    expect(result).toEqual(expectedResult);
  });
});
