/* eslint-env jest */

import type { TangibleEntityConfig } from '../../../tsTypes';

import adaptProjectionForCalculatedFields from './index';

describe('adaptProjectionForCalculatedFields', () => {
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
        array: true,
        required: true,
      },
    ],
  };

  test('shoud return {}', () => {
    const projection: Record<string, 1> = {};

    const result = adaptProjectionForCalculatedFields(projection, exampleConfig);

    const expectedResult = {};

    expect(result).toEqual(expectedResult);
  });

  test('shoud return { text: 1 }', () => {
    const projection: Record<string, 1> = { text1: 1 };

    const result = adaptProjectionForCalculatedFields(projection, exampleConfig);

    const expectedResult = { text1: 1 };

    expect(result).toEqual(expectedResult);
  });

  test('shoud return { texs: 1, text2: 1, text3: 1 }', () => {
    const projection: Record<string, 1> = { texts: 1 };

    const result = adaptProjectionForCalculatedFields(projection, exampleConfig);

    const expectedResult = { texts: 1, text2: 1, text3: 1 };

    expect(result).toEqual(expectedResult);
  });
});
