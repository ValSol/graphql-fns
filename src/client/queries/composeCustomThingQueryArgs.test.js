// @flow
/* eslint-env jest */

import type { GeneralConfig, ActionSignatureMethods, ThingConfig } from '../../flowTypes';

import composeCustomThingQueryArgs from './composeCustomThingQueryArgs';

describe('composeCustomThingQueryArgs', () => {
  test('should compose customThing query without args', () => {
    const prefixName = 'Home';
    const signatureMethods: ActionSignatureMethods = {
      name: 'getThing',
      specificName: ({ name }) => `get${name}`,
      argNames: () => [],
      argTypes: () => [],
      type: ({ name }) => `${name}!`,
      config: (thingConfig) => thingConfig,
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
    const queryName = 'getThing';
    const custom = { Query: { [queryName]: signatureMethods } };

    const generalConfig: GeneralConfig = { thingConfigs, custom };

    const expectedResult = ['query Home_getExample {', '  getExample {'];

    const result = composeCustomThingQueryArgs(
      prefixName,
      queryName,
      thingConfig,
      generalConfig,
      {},
    );
    expect(result).toEqual(expectedResult);
  });

  test('should compose customThing query with args', () => {
    const prefixName = 'Home';
    const signatureMethods: ActionSignatureMethods = {
      name: 'loadThing',
      specificName: ({ name }) => `load${name}`,
      argNames: () => ['path', 'index'],
      argTypes: () => ['String!', 'Int'],
      type: ({ name }) => `${name}!`,
      config: (thingConfig) => thingConfig,
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
    const queryName = 'loadThing';
    const custom = { Query: { [queryName]: signatureMethods } };

    const generalConfig: GeneralConfig = { thingConfigs, custom };

    const expectedResult = [
      'query Home_loadExample($path: String!, $index: Int) {',
      '  loadExample(path: $path, index: $index) {',
    ];

    const result = composeCustomThingQueryArgs(
      prefixName,
      queryName,
      thingConfig,
      generalConfig,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
