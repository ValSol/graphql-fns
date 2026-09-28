import type { CalculatedField, ResolverCreatorArg, TangibleEntityConfig } from '@/tsTypes';

import {
  attachCalculatedContext,
  copyCalculatedContext,
} from '@/resolvers/utils/calculatedContext';
import composeCalculatedFieldResolver from '.';

describe('composeCalculatedFieldResolver', () => {
  const upper: CalculatedField = {
    name: 'upper',
    calculatedType: 'textFields',
    type: 'calculatedFields',
  };

  const remote: CalculatedField = {
    name: 'remote',
    calculatedType: 'textFields',
    type: 'calculatedFields',
    async: true,
  };

  const entityConfig: TangibleEntityConfig = {
    name: 'Example',
    type: 'tangible',
    textFields: [{ name: 'text', type: 'textFields' }],
    calculatedFields: [upper, remote],
  };

  const composeResolverCreatorArg = (
    asyncFunc: (...args: any[]) => Promise<any>,
  ): ResolverCreatorArg => ({
    entityConfig,
    generalConfig: { allEntityConfigs: { Example: entityConfig } },
    serversideConfig: {
      calculatedFields: {
        Example: {
          upper: { func: (args, { text }) => `${text}`.toUpperCase() },
          remote: {
            asyncFunc,
            func: (args, data, resolverArg, asyncFuncResult, index) =>
              Array.isArray(asyncFuncResult) ? asyncFuncResult[index] : asyncFuncResult,
          },
        },
      },
    },
  });

  const rootResolverArg = {
    parent: null,
    args: { token: 'root' },
    context: {},
    info: { projection: {}, fieldArgs: {}, path: [] },
    resolverOptions: { involvedFilters: {} },
  } as any;

  test('should return an already calculated value', () => {
    const resolver = composeCalculatedFieldResolver(
      upper,
      composeResolverCreatorArg(async () => null),
    );

    expect(resolver({ text: 'a', upper: 'CALCULATED' }, {}, {}, {})).toBe('CALCULATED');
  });

  test('should calculate from the hidden context: raw data, root arg, async result & index', () => {
    const resolver = composeCalculatedFieldResolver(
      remote,
      composeResolverCreatorArg(async () => null),
    );

    const entity = attachCalculatedContext(
      { id: 'raw', text: 'b' },
      { asyncFuncResults: { remote: ['first', 'second'] }, index: 1, resolverArg: rootResolverArg },
    );

    // like "transformAfter" does
    const parent = copyCalculatedContext(entity, { ...entity, id: 'global' });

    expect(resolver(parent, {}, {}, {})).toBe('second');

    const upperResolver = composeCalculatedFieldResolver(
      upper,
      composeResolverCreatorArg(async () => null),
    );

    expect(upperResolver(parent, {}, {}, {})).toBe('B');
  });

  test('should calculate without context like for a single-entity action', async () => {
    const asyncFunc = jest.fn(async (args, resolverCreatorArg, resolverArg, entity) => {
      expect(Array.isArray(entity)).toBe(false);

      return `remote ${entity.text}`;
    });

    const resolver = composeCalculatedFieldResolver(remote, composeResolverCreatorArg(asyncFunc));

    const parent = { text: 'c' };

    await expect(resolver(parent, {}, {}, {})).resolves.toBe('remote c');

    // the same parent & args: "asyncFunc" is not called again
    await expect(resolver(parent, {}, {}, {})).resolves.toBe('remote c');
    expect(asyncFunc).toHaveBeenCalledTimes(1);

    // other args
    await resolver(parent, { lang: 'uk' }, {}, {});
    expect(asyncFunc).toHaveBeenCalledTimes(2);

    const upperResolver = composeCalculatedFieldResolver(
      upper,
      composeResolverCreatorArg(asyncFunc),
    );

    expect(upperResolver(parent, {}, {}, {})).toBe('C');
  });

  test('should fall back if the context has no result of "asyncFunc" of the field', async () => {
    const asyncFunc = jest.fn(async (args, resolverCreatorArg, resolverArg, entity) => entity.text);

    const resolver = composeCalculatedFieldResolver(remote, composeResolverCreatorArg(asyncFunc));

    const parent = attachCalculatedContext(
      { text: 'd' },
      { asyncFuncResults: {}, index: 0, resolverArg: rootResolverArg },
    );

    await expect(resolver(parent, {}, {}, {})).resolves.toBe('d');
    expect(asyncFunc).toHaveBeenCalledTimes(1);
  });
});
