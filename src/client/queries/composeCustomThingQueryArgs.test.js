// @flow
/* eslint-env jest */

import type { GeneralConfig, SignatureMethods, ThingConfig } from '../../flowTypes';

import composeCustomThingQueryArgs from './composeCustomThingQueryArgs';

describe('composeCustomThingQueryArgs', () => {
  test('should compose customThing query without args', () => {
    const signatureMethods: SignatureMethods = {
      name: ({ name }) => `get${name}`,
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
    const queryName = 'Thing';
    const custom = { Query: { [queryName]: signatureMethods } };

    const generalConfig: GeneralConfig = { thingConfigs, custom };

    const expectedResult = ['query getExample {', '  getExample {'];

    const result = composeCustomThingQueryArgs(queryName, thingConfig, generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should compose customThing query with args', () => {
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
    const queryName = 'loadThing';
    const custom = { Query: { [queryName]: signatureMethods } };

    const generalConfig: GeneralConfig = { thingConfigs, custom };

    const expectedResult = [
      'query loadExample($path: String!, $index: Int) {',
      '  loadExample(path: $path, index: $index) {',
    ];

    const result = composeCustomThingQueryArgs(queryName, thingConfig, generalConfig);
    expect(result).toEqual(expectedResult);
  });
});