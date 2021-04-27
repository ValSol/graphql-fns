// @flow
/* eslint-env jest */
import type { GeneralConfig, ObjectSignatureMethods, ThingConfig } from '../flowTypes';

import composeObjectSignature from './composeObjectSignature';

describe('composeObjectSignature', () => {
  test('should return correct custom input object type', () => {
    const thingTimeRangeInput: ObjectSignatureMethods = {
      name: 'thingTimeRangeInput',
      specificName: ({ name }) => `${name}TimeRangeInput`,
      fieldNames: () => ['start', 'end'],
      fieldTypes: () => ['DateTime!', 'DateTime!'],
    };

    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const generalConfig: GeneralConfig = {
      thingConfigs: { Example: thingConfig },
    };

    const expectedResult = `input ExampleTimeRangeInput {
  start: DateTime!
  end: DateTime!
}`;
    const input = true;
    const result = composeObjectSignature(thingTimeRangeInput, thingConfig, generalConfig, input);
    expect(result).toBe(expectedResult);
  });

  test('should return correct custom return object type', () => {
    const thingWithRating: ObjectSignatureMethods = {
      name: 'thingWithRating',
      specificName: ({ name }) => `${name}WithRating`,
      fieldNames: () => ['payload', 'rating'],
      fieldTypes: ({ name }) => [`${name}!`, 'Float!'],
      config: (thingConfig) => thingConfig,
    };

    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const generalConfig: GeneralConfig = {
      thingConfigs: { Example: thingConfig },
    };

    const expectedResult = `type ExampleWithRating {
  payload: Example!
  rating: Float!
}`;

    const result = composeObjectSignature(thingWithRating, thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });

  test('should return empty string for custom return object type', () => {
    const thingWithRating: ObjectSignatureMethods = {
      name: 'thingWithRating',
      specificName: ({ name }) => (name === 'Example' ? '' : `${name}WithRating`),
      fieldNames: () => ['payload', 'rating'],
      fieldTypes: ({ name }) => [`${name}!`, 'Float!'],
      config: (thingConfig) => thingConfig,
    };

    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
          index: true,
        },
      ],
    };

    const generalConfig: GeneralConfig = {
      thingConfigs: { Example: thingConfig },
    };

    const expectedResult = '';

    const result = composeObjectSignature(thingWithRating, thingConfig, generalConfig);
    expect(result).toBe(expectedResult);
  });
});
