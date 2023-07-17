/* eslint-env jest */

import type { GeneralConfig, ActionSignatureMethods, EntityConfig } from '../../tsTypes';

import composeCustomEntityMutationArgs from './composeCustomEntityMutationArgs';

describe('composeCustomEntityMutationArgs', () => {
  test('should compose customEntity mutation without args', () => {
    const prefixName = 'Home';
    const signatureMethods: ActionSignatureMethods = {
      name: 'loadEntity',
      specificName: ({ name }: any) => `load${name}`,
      argNames: () => [],
      argTypes: () => [],
      involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: name }),
      type: ({ name }: any) => `${name}!`,
      config: (thinConfig: any) => thinConfig,
    };

    const entityConfig = {} as EntityConfig;

    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
      ],
      relationalFields: [
        {
          name: 'examples',
          oppositeName: 'parentExample',
          array: true,
          config: entityConfig,
          type: 'relationalFields',
        },
        {
          name: 'parentExample',
          oppositeName: 'examples',
          array: true,
          parent: true,
          config: entityConfig,
          type: 'relationalFields',
        },
      ],
    });

    const childArgs = { examples_where: 'ExampleWhereInput' };

    const allEntityConfigs = { Example: entityConfig };
    const mutationName = 'loadEntity';
    const custom = { Mutation: { [mutationName]: signatureMethods } };

    const generalConfig: GeneralConfig = { allEntityConfigs, custom };

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
      specificName: ({ name }: any) => `load${name}`,
      argNames: () => ['path', 'index'],
      argTypes: () => ['String!', 'Int'],
      involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: name }),
      type: ({ name }: any) => `${name}!`,
      config: (thinConfig: any) => thinConfig,
    };

    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
      ],
    };

    const allEntityConfigs = { Example: entityConfig };
    const mutationName = 'loadEntity';
    const custom = { Mutation: { [mutationName]: signatureMethods } };

    const generalConfig: GeneralConfig = { allEntityConfigs, custom };

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
