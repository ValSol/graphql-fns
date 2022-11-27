// @flow
/* eslint-env jest */

import type { GeneralConfig, ActionSignatureMethods, EntityConfig } from '../../flowTypes';

import composeCustomEntityMutationArgs from './composeCustomEntityMutationArgs';

describe('composeCustomEntityMutationArgs', () => {
  test('should compose customEntity mutation without args', () => {
    const prefixName = 'Home';
    const signatureMethods: ActionSignatureMethods = {
      name: 'loadEntity',
      specificName: ({ name }) => `load${name}`,
      argNames: () => [],
      argTypes: () => [],
      type: ({ name }) => `${name}!`,
      config: (thinConfig) => thinConfig,
    };

    const entityConfig = {};

    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
      relationalFields: [
        {
          name: 'examples',
          array: true,
          config: entityConfig,
        },
      ],
    });

    const childArgs = { examples_where: 'ExampleWhereInput' };

    const entityConfigs = { Example: entityConfig };
    const mutationName = 'loadEntity';
    const custom = { Mutation: { [mutationName]: signatureMethods } };

    const generalConfig: GeneralConfig = { entityConfigs, custom };

    const expectedResult = [
      'mutation Home_loadExample($examples_where: ExampleWhereInput) {',
      '  loadExample {',
    ];

    const result = composeCustomEntityMutationArgs(
      prefixName,
      mutationName,
      entityConfig,
      generalConfig,
      childArgs,
    );
    expect(result).toEqual(expectedResult);
  });

  test('should compose customEntity mutation with args', () => {
    const prefixName = 'Home';
    const signatureMethods: ActionSignatureMethods = {
      name: 'loadEntity',
      specificName: ({ name }) => `load${name}`,
      argNames: () => ['path', 'index'],
      argTypes: () => ['String!', 'Int'],
      type: ({ name }) => `${name}!`,
      config: (thinConfig) => thinConfig,
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

    const entityConfigs = { Example: entityConfig };
    const mutationName = 'loadEntity';
    const custom = { Mutation: { [mutationName]: signatureMethods } };

    const generalConfig: GeneralConfig = { entityConfigs, custom };

    const expectedResult = [
      'mutation Home_loadExample($path: String!, $index: Int) {',
      '  loadExample(path: $path, index: $index) {',
    ];

    const result = composeCustomEntityMutationArgs(
      prefixName,
      mutationName,
      entityConfig,
      generalConfig,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
