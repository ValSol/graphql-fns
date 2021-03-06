// @flow
/* eslint-env jest */

import type { GeneralConfig, ActionSignatureMethods, ThingConfig } from '../../flowTypes';

import composeCustomThingMutationArgs from './composeCustomThingMutationArgs';

describe('composeCustomThingMutationArgs', () => {
  test('should compose customThing mutation without args', () => {
    const prefixName = 'Home';
    const signatureMethods: ActionSignatureMethods = {
      name: 'loadThing',
      specificName: ({ name }) => `load${name}`,
      argNames: () => [],
      argTypes: () => [],
      type: ({ name }) => `${name}!`,
      config: (thinConfig) => thinConfig,
    };

    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const thingConfigs = { Example: thingConfig };
    const mutationName = 'loadThing';
    const custom = { Mutation: { [mutationName]: signatureMethods } };

    const generalConfig: GeneralConfig = { thingConfigs, custom };

    const expectedResult = ['mutation Home_loadExample {', '  loadExample {'];

    const result = composeCustomThingMutationArgs(
      prefixName,
      mutationName,
      thingConfig,
      generalConfig,
    );
    expect(result).toEqual(expectedResult);
  });

  test('should compose customThing mutation with args', () => {
    const prefixName = 'Home';
    const signatureMethods: ActionSignatureMethods = {
      name: 'loadThing',
      specificName: ({ name }) => `load${name}`,
      argNames: () => ['path', 'index'],
      argTypes: () => ['String!', 'Int'],
      type: ({ name }) => `${name}!`,
      config: (thinConfig) => thinConfig,
    };

    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const thingConfigs = { Example: thingConfig };
    const mutationName = 'loadThing';
    const custom = { Mutation: { [mutationName]: signatureMethods } };

    const generalConfig: GeneralConfig = { thingConfigs, custom };

    const expectedResult = [
      'mutation Home_loadExample($path: String!, $index: Int) {',
      '  loadExample(path: $path, index: $index) {',
    ];

    const result = composeCustomThingMutationArgs(
      prefixName,
      mutationName,
      thingConfig,
      generalConfig,
    );
    expect(result).toEqual(expectedResult);
  });
});
