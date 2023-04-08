/* eslint-env jest */
import type { ActionSignatureMethods, ObjectSignatureMethods } from '../tsTypes';

import composeCustom from './composeCustom';

describe('composeCustom', () => {
  test('compose simple allEntityConfigs', () => {
    const entityTimeRange: ObjectSignatureMethods = {
      name: 'entityTimeRange',
      specificName: ({ name }: any) => `${name}TimeRange`,
      fieldNames: () => ['start', 'end'],
      fieldTypes: () => ['DateTime!', 'DateTime!'],
    };

    const getEntity: ActionSignatureMethods = {
      name: 'getEntity',
      specificName: ({ name }: any) => `get${name}`,
      argNames: () => ['whereOne'],
      argTypes: ({ name }: any) => [`${name}WhereOneInput!`],
      involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: name }),
      type: ({ name }: any) => name,
      config: (entityConfig: any) => entityConfig,
    };

    const cloneEntity: ActionSignatureMethods = {
      name: 'cloneEntity',
      specificName: ({ name }: any) =>
        name === 'Restaurant' || name === 'Post' ? `clone${name}` : '',
      argNames: () => ['whereOne'],
      argTypes: ({ name }: any) => [`${name}WhereOneInput!`],
      involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: name }),
      type: ({ name }: any) => `${name}Clone!`,
      config: (entityConfig: any, { allEntityConfigs: allEntityConfigs2 }: any) => {
        const { name } = entityConfig;
        return allEntityConfigs2[`${name}Clone`];
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
