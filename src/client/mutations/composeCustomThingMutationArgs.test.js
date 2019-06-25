// @flow
/* eslint-env jest */

import type { GeneralConfig, SignatureMethods, ThingConfig } from '../../flowTypes';

import composeCustomThingMutationArgs from './composeCustomThingMutationArgs';

describe('composeCustomThingMutationArgs', () => {
  test('should compose customThing mutation without args', () => {
    const signatureMethods: SignatureMethods = {
      name: ({ name }) => `load${name}`,
      argNames: () => [],
      argTypes: () => [],
      type: ({ name }) => `${name}!`,
    };

    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const thingConfigs = [thingConfig];
    const mutationName = 'loadThing';
    const custom = { Mutation: { [mutationName]: signatureMethods } };

    const generalConfig: GeneralConfig = { thingConfigs, custom };

    const expectedResult = ['mutation loadExample {', '  loadExample {'];

    const result = composeCustomThingMutationArgs(mutationName, thingConfig, generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should compose customThing mutation with args', () => {
    const signatureMethods: SignatureMethods = {
      name: ({ name }) => `load${name}`,
      argNames: () => ['path', 'index'],
      argTypes: () => ['String!', 'Int'],
      type: ({ name }) => `${name}!`,
    };

    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const thingConfigs = [thingConfig];
    const mutationName = 'loadThing';
    const custom = { Mutation: { [mutationName]: signatureMethods } };

    const generalConfig: GeneralConfig = { thingConfigs, custom };

    const expectedResult = [
      'mutation loadExample($path: String!, $index: Int) {',
      '  loadExample(path: $path, index: $index) {',
    ];

    const result = composeCustomThingMutationArgs(mutationName, thingConfig, generalConfig);
    expect(result).toEqual(expectedResult);
  });
});
