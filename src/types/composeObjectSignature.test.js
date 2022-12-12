// @flow
/* eslint-env jest */
import type { GeneralConfig, ObjectSignatureMethods, EntityConfig } from '../flowTypes';

import composeObjectSignature from './composeObjectSignature';

describe('composeObjectSignature', () => {
  test('should return correct custom input object type', () => {
    const entityTimeRangeInput: ObjectSignatureMethods = {
      name: 'entityTimeRangeInput',
      specificName: ({ name }) => `${name}TimeRangeInput`,
      fieldNames: () => ['start', 'end'],
      fieldTypes: () => ['DateTime!', 'DateTime!'],
    };

    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Example: entityConfig },
    };

    const expectedResult = `input ExampleTimeRangeInput {
  start: DateTime!
  end: DateTime!
}`;
    const input = true;
    const result = composeObjectSignature(entityTimeRangeInput, entityConfig, generalConfig, input);
    expect(result).toBe(expectedResult);
  });

  test('should return correct custom return object type', () => {
    const entityWithRating: ObjectSignatureMethods = {
      name: 'entityWithRating',
      specificName: ({ name }) => `${name}WithRating`,
      fieldNames: () => ['payload', 'rating'],
      fieldTypes: ({ name }) => [`${name}!`, 'Float!'],
      config: (entityConfig) => entityConfig,
    };

    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Example: entityConfig },
    };

    const expectedResult = `type ExampleWithRating {
  payload: Example!
  rating: Float!
}`;

    const result = composeObjectSignature(entityWithRating, entityConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should return empty string for custom return object type', () => {
    const entityWithRating: ObjectSignatureMethods = {
      name: 'entityWithRating',
      specificName: ({ name }) => (name === 'Example' ? '' : `${name}WithRating`),
      fieldNames: () => ['payload', 'rating'],
      fieldTypes: ({ name }) => [`${name}!`, 'Float!'],
      config: (entityConfig) => entityConfig,
    };

    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Example: entityConfig },
    };

    const expectedResult = '';

    const result = composeObjectSignature(entityWithRating, entityConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });
});
