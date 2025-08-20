/* eslint-env jest */

import { GraphQLResolveInfo } from 'graphql';

import { InfoEssence, TangibleEntityConfig } from '@/tsTypes';
import createInfoEssence from '.';

describe('createInfoEssence', () => {
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
        name: 'calculatedField',
        calculatedType: 'textFields',
        type: 'calculatedFields',
        fieldsToUseNames: ['text2', 'text3'],
        func: ({ text2, text3 }) => [text2, text3] as string[],
        array: true,
        required: true,
      },
    ],
  };

  const projection = { calculatedField: 1 } as Record<string, 1>;

  test('args: projection', () => {
    const result = createInfoEssence(projection);

    const expectedResult = createInfoEssence(projection);

    expect(result).toEqual(expectedResult);
  });

  test('args: projection, entityConfig', () => {
    const result = createInfoEssence(projection, entityConfig);

    const expectedResult = {
      projection: { calculatedField: 1, text2: 1, text3: 1 },
      fieldArgs: {},
      path: [],
    };

    expect(result).toEqual(expectedResult);
  });

  test('args: projection, entityConfig, infoEssence', () => {
    const fieldArgs = { text2: 'testArg' } as Record<string, any>;
    const path = ['testPath'];
    const originalInfo = {} as GraphQLResolveInfo;

    const infoEssence = {
      projection: { text1: 1 } as Record<string, 1>,
      fieldArgs,
      path,
      originalInfo,
    } as InfoEssence;

    const result = createInfoEssence(projection, entityConfig, infoEssence);

    const expectedResult = {
      projection: { calculatedField: 1, text1: 1, text2: 1, text3: 1 },
      fieldArgs,
      path,
      originalInfo,
    };

    expect(result).toEqual(expectedResult);
  });
});
