// @flow
/* eslint-env jest */
import type { GeneralConfig, ActionSignatureMethods, EntityConfig } from '../flowTypes';

import composeCustomActionSignature from './composeCustomActionSignature';

describe('composeCustomActionSignature', () => {
  test('should return correct results for empty args arrays', () => {
    const signatureMethods: ActionSignatureMethods = {
      name: 'getEntity',
      specificName(entityConfig) {
        const { name } = entityConfig;
        return `get${name}`;
      },
      argNames() {
        return [];
      },
      argTypes() {
        return [];
      },
      type(entityConfig) {
        const { name } = entityConfig;
        return `[${name}!]!`;
      },
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

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Example: entityConfig },
    };
    const expectedResult = 'getExample: [Example!]!';

    const result = composeCustomActionSignature(signatureMethods, entityConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should return correct results for fulfilled args arrays', () => {
    const queryParts = {
      name: 'getEntity',
      specificName(entityConfig) {
        const { name } = entityConfig;
        return `get${name}`;
      },
      argNames() {
        return ['path', 'index'];
      },
      argTypes() {
        return ['String!', 'Int'];
      },
      type(entityConfig) {
        const { name } = entityConfig;
        return `${name}!`;
      },
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
    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Example: entityConfig },
    };

    const expectedResult = 'getExample(path: String!, index: Int): Example!';

    const result = composeCustomActionSignature(queryParts, entityConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should return empty results', () => {
    const queryParts = {
      name: 'getEntity',
      specificName(entityConfig) {
        const { name } = entityConfig;
        return name === 'Example' ? '' : `get${name}`;
      },
      argNames() {
        return ['path', 'index'];
      },
      argTypes() {
        return ['String!', 'Int'];
      },
      type(entityConfig) {
        const { name } = entityConfig;
        return `${name}!`;
      },
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
    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Example: entityConfig },
    };

    const expectedResult = '';

    const result = composeCustomActionSignature(queryParts, entityConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should return action that return scalar', () => {
    const queryParts = {
      name: 'tokenOfEntity',
      specificName(entityConfig) {
        const { name } = entityConfig;
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

    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };
    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Example: entityConfig },
    };

    const expectedResult = 'tokenOfExample(path: String!, index: Int): String!';

    const result = composeCustomActionSignature(queryParts, entityConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });
});
