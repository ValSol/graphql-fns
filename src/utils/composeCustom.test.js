// @flow
/* eslint-env jest */
import type { ActionSignatureMethods, ObjectSignatureMethods } from '../flowTypes';

import composeCustom from './composeCustom';

describe('composeCustom', () => {
  test('compose simple entityConfigs', () => {
    const entityTimeRange: ObjectSignatureMethods = {
      name: 'entityTimeRange',
      specificName: ({ name }) => `${name}TimeRange`,
      fieldNames: () => ['start', 'end'],
      fieldTypes: () => ['DateTime!', 'DateTime!'],
    };

    const getEntity: ActionSignatureMethods = {
      name: 'getEntity',
      specificName: ({ name }) => `get${name}`,
      argNames: () => ['whereOne'],
      argTypes: ({ name }) => [`${name}WhereOneInput!`],
      type: ({ name }) => name,
      config: (entityConfig) => entityConfig,
    };

    const cloneEntity: ActionSignatureMethods = {
      name: 'cloneEntity',
      specificName: ({ name }) => (name === 'Restaurant' || name === 'Post' ? `clone${name}` : ''),
      argNames: () => ['whereOne'],
      argTypes: ({ name }) => [`${name}WhereOneInput!`],
      type: ({ name }) => `${name}Clone!`,
      config: (entityConfig, { entityConfigs: entityConfigs2 }) => {
        const { name } = entityConfig;
        return entityConfigs2[`${name}Clone`];
      },
    };

    const result = composeCustom({
      Input: [entityTimeRange],
      Query: [getEntity],
      Mutation: [cloneEntity],
    });

    const expectedResult = {
      Input: { entityTimeRange },
      Query: { getEntity },
      Mutation: { cloneEntity },
    };
    expect(result).toEqual(expectedResult);
  });
});
