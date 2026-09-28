import type { GeneralConfig, ServersideConfig, TangibleEntityConfig } from '@/tsTypes';

import adaptProjectionForCalculatedFields from '.';

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

  const generalConfig: GeneralConfig = { allEntityConfigs: { Example: exampleConfig } };

  const serversideConfig: ServersideConfig = {
    calculatedFields: {
      Example: {
        text: { fieldsToUseNames: ['text1'], func: (args, { text1 }) => text1 },
        texts: { fieldsToUseNames: ['text2', 'text3'], func: (args, { text2, text3 }) => [text2, text3] },
      },
    },
  };

  test('shoud return {}', () => {
    const projection: Record<string, 1> = {};

    const result = adaptProjectionForCalculatedFields(
      projection,
      exampleConfig,
      generalConfig,
      serversideConfig,
    );

    const expectedResult = {};

    expect(result).toEqual(expectedResult);
  });

  test('shoud return { text: 1 }', () => {
    const projection: Record<string, 1> = { text1: 1 };

    const result = adaptProjectionForCalculatedFields(
      projection,
      exampleConfig,
      generalConfig,
      serversideConfig,
    );

    const expectedResult = { text1: 1 };

    expect(result).toEqual(expectedResult);
  });

  test('shoud return { text1: 1, text2: 1, text3: 1 } without calculated fields', () => {
    const projection: Record<string, 1> = { texts: 1, text1: 1 };

    const result = adaptProjectionForCalculatedFields(
      projection,
      exampleConfig,
      generalConfig,
      serversideConfig,
    );

    const expectedResult = { text1: 1, text2: 1, text3: 1 };

    expect(result).toEqual(expectedResult);
  });

  test('shoud return { _id: 1 } instead of an empty projection that would fetch the whole document', () => {
    const exampleConfig2: TangibleEntityConfig = {
      ...exampleConfig,
      calculatedFields: [
        { name: 'text', calculatedType: 'textFields', type: 'calculatedFields' },
      ],
    };

    const result = adaptProjectionForCalculatedFields(
      { text: 1 },
      exampleConfig2,
      { allEntityConfigs: { Example: exampleConfig2 } },
      { calculatedFields: { Example: { text: { func: () => '' } } } },
    );

    expect(result).toEqual({ _id: 1 });
  });
});
