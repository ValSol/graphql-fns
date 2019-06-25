// @flow
/* eslint-env jest */
import type { GeneralConfig, SignatureMethods, ThingConfig } from '../flowTypes';

import composeSignature from './composeSignature';

describe('composeSignature', () => {
  test('should return correct results for empty args arrays', () => {
    const signatureMethods: SignatureMethods = {
      name(thingConfig) {
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
      thingConfigs: [thingConfig],
    };
    const expectedResult = 'getExample: [Example!]!';

    const result = composeSignature(signatureMethods, thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should return correct results for fulfilled args arrays', () => {
    const queryParts = {
      name(thingConfig) {
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
      thingConfigs: [thingConfig],
    };

    const expectedResult = 'getExample(path: String!, index: Int): Example!';

    const result = composeSignature(queryParts, thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });
});
