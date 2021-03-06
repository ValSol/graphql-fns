// @flow
/* eslint-env jest */
import type { GeneralConfig, ActionSignatureMethods, ThingConfig } from '../flowTypes';

import composeActionSignature from './composeActionSignature';

describe('composeActionSignature', () => {
  test('should return correct results for empty args arrays', () => {
    const signatureMethods: ActionSignatureMethods = {
      name: 'getThing',
      specificName(thingConfig) {
        const { name } = thingConfig;
        return `get${name}`;
      },
      argNames() {
        return [];
      },
      argTypes() {
        return [];
      },
      type(thingConfig) {
        const { name } = thingConfig;
        return `[${name}!]!`;
      },
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

    const generalConfig: GeneralConfig = {
      thingConfigs: { Example: thingConfig },
    };
    const expectedResult = 'getExample: [Example!]!';

    const result = composeActionSignature(signatureMethods, thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should return correct results for fulfilled args arrays', () => {
    const queryParts = {
      name: 'getThing',
      specificName(thingConfig) {
        const { name } = thingConfig;
        return `get${name}`;
      },
      argNames() {
        return ['path', 'index'];
      },
      argTypes() {
        return ['String!', 'Int'];
      },
      type(thingConfig) {
        const { name } = thingConfig;
        return `${name}!`;
      },
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
    const generalConfig: GeneralConfig = {
      thingConfigs: { Example: thingConfig },
    };

    const expectedResult = 'getExample(path: String!, index: Int): Example!';

    const result = composeActionSignature(queryParts, thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should return empty results', () => {
    const queryParts = {
      name: 'getThing',
      specificName(thingConfig) {
        const { name } = thingConfig;
        return name === 'Example' ? '' : `get${name}`;
      },
      argNames() {
        return ['path', 'index'];
      },
      argTypes() {
        return ['String!', 'Int'];
      },
      type(thingConfig) {
        const { name } = thingConfig;
        return `${name}!`;
      },
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
    const generalConfig: GeneralConfig = {
      thingConfigs: { Example: thingConfig },
    };

    const expectedResult = '';

    const result = composeActionSignature(queryParts, thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should return action that return scalar', () => {
    const queryParts = {
      name: 'tokenOfThing',
      specificName(thingConfig) {
        const { name } = thingConfig;
        return `tokenOf${name}`;
      },
      argNames() {
        return ['path', 'index'];
      },
      argTypes() {
        return ['String!', 'Int'];
      },
      type: () => 'String!',
      config: () => null,
    };

    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const generalConfig: GeneralConfig = {
      thingConfigs: { Example: thingConfig },
    };

    const expectedResult = 'tokenOfExample(path: String!, index: Int): String!';

    const result = composeActionSignature(queryParts, thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });
});
