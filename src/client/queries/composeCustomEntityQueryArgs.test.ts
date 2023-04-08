/* eslint-env jest */

import type { GeneralConfig, ActionSignatureMethods, EntityConfig } from '../../tsTypes';

import composeCustomEntityQueryArgs from './composeCustomEntityQueryArgs';

describe('composeCustomEntityQueryArgs', () => {
  test('should compose customEntity query without args', () => {
    const prefixName = 'Home';
    const signatureMethods: ActionSignatureMethods = {
      name: 'getEntity',
      specificName: ({ name }: any) => `get${name}`,
      argNames: () => [],
      argTypes: () => [],
      involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: name }),
      type: ({ name }: any) => `${name}!`,
      config: (entityConfig: any) => entityConfig,
    };

    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const allEntityConfigs = { Example: entityConfig };
    const queryName = 'getEntity';
    const custom = { Query: { [queryName]: signatureMethods } };

    const generalConfig: GeneralConfig = { allEntityConfigs, custom };

    const expectedResult = ['query Home_getExample {', '  getExample {'];

    const result = composeCustomEntityQueryArgs(
      prefixName,
      queryName,
      entityConfig,
      generalConfig,
      {},
    );
    expect(result).toEqual(expectedResult);
  });

  test('should compose customEntity query with args', () => {
    const prefixName = 'Home';
    const signatureMethods: ActionSignatureMethods = {
      name: 'loadEntity',
      specificName: ({ name }: any) => `load${name}`,
      argNames: () => ['path', 'index'],
      argTypes: () => ['String!', 'Int'],
      involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: name }),
      type: ({ name }: any) => `${name}!`,
      config: (entityConfig: any) => entityConfig,
    };

    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const allEntityConfigs = { Example: entityConfig };
    const queryName = 'loadEntity';
    const custom = { Query: { [queryName]: signatureMethods } };

    const generalConfig: GeneralConfig = { allEntityConfigs, custom };

    const expectedResult = [
      'query Home_loadExample($path: String!, $index: Int) {',
      '  loadExample(path: $path, index: $index) {',
    ];

    const result = composeCustomEntityQueryArgs(
      prefixName,
      queryName,
      entityConfig,
      generalConfig,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
