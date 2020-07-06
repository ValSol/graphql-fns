// @flow
/* eslint-env jest */
import type { ActionSignatureMethods, ObjectSignatureMethods } from '../flowTypes';

import composeCustom from './composeCustom';

describe('composeCustom', () => {
  test('compose simple thingConfigs', () => {
    const thingTimeRange: ObjectSignatureMethods = {
      name: 'thingTimeRange',
      specificName: ({ name }) => `${name}TimeRange`,
      fieldNames: () => ['start', 'end'],
      fieldTypes: () => ['DateTime!', 'DateTime!'],
    };

    const getThing: ActionSignatureMethods = {
      name: 'getThing',
      specificName: ({ name }) => `get${name}`,
      argNames: () => ['whereOne'],
      argTypes: ({ name }) => [`${name}WhereOneInput!`],
      type: ({ name }) => name,
      config: (thingConfig) => thingConfig,
    };

    const cloneThing: ActionSignatureMethods = {
      name: 'cloneThing',
      specificName: ({ name }) => (name === 'Restaurant' || name === 'Post' ? `clone${name}` : ''),
      argNames: () => ['whereOne'],
      argTypes: ({ name }) => [`${name}WhereOneInput!`],
      type: ({ name }) => `${name}Clone!`,
      config: (thingConfig, { thingConfigs: thingConfigs2 }) => {
        const { name } = thingConfig;
        return thingConfigs2[`${name}Clone`];
      },
    };

    const result = composeCustom({
      Input: [thingTimeRange],
      Query: [getThing],
      Mutation: [cloneThing],
    });

    const expectedResult = {
      Input: { thingTimeRange },
      Query: { getThing },
      Mutation: { cloneThing },
    };
    expect(result).toEqual(expectedResult);
  });
});
