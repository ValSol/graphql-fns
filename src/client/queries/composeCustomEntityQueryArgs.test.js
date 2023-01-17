// @flow
/* eslint-env jest */

import type { GeneralConfig, ActionSignatureMethods, EntityConfig } from '../../flowTypes';

import composeCustomEntityQueryArgs from './composeCustomEntityQueryArgs';

describe('composeCustomEntityQueryArgs', () => {
  test('should compose customEntity query without args', () => {
    const prefixName = 'Home';
    const signatureMethods: ActionSignatureMethods = {
      name: 'getEntity',
      specificName: ({ name }) => `get${name}`,
      argNames: () => [],
      argTypes: () => [],
      involvedEntityNames: ({ name }) => ({ inputEntity: name }),
      type: ({ name }) => `${name}!`,
      config: (entityConfig) => entityConfig,
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
      specificName: ({ name }) => `load${name}`,
      argNames: () => ['path', 'index'],
      argTypes: () => ['String!', 'Int'],
      involvedEntityNames: ({ name }) => ({ inputEntity: name }),
      type: ({ name }) => `${name}!`,
      config: (entityConfig) => entityConfig,
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
