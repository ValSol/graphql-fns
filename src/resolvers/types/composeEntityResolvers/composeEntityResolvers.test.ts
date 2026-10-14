import type { GeneralConfig, ServersideConfig, TangibleEntityConfig } from '../../../tsTypes';

import { attachCalculatedContext } from '@/resolvers/utils/calculatedContext';
import composeEntityResolvers from '.';

describe('composeEntityResolvers', () => {
  test('should create resolver for type', () => {
    const personConfig = {} as TangibleEntityConfig;

    const placeConfig: TangibleEntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [
        {
          name: 'title',
          required: true,
          type: 'textFields',
        },
      ],
      relationalFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'customers',
          oppositeName: 'favoritePlace',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
      ],
    };

    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          required: true,
          type: 'textFields',
        },
        {
          name: 'lastName',
          required: true,
          type: 'textFields',
        },
      ],
      relationalFields: [
        {
          name: 'friends',
          oppositeName: 'fellows',
          config: personConfig,
          array: true,
          required: true,
          type: 'relationalFields',
        },
        {
          name: 'fellows',
          oppositeName: 'friends',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'enemies',
          oppositeName: 'opponents',
          config: personConfig,
          array: true,
          type: 'relationalFields',
        },
        {
          name: 'opponents',
          oppositeName: 'enemies',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
          type: 'relationalFields',
        },
        {
          name: 'favoritePlace',
          oppositeName: 'customers',
          config: placeConfig,
          type: 'relationalFields',
        },
      ],
    });
    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Place: placeConfig, Person: personConfig },
    };

    const serversideConfig: Record<string, any> = {};

    const result = composeEntityResolvers(personConfig, generalConfig, serversideConfig);

    expect(typeof result.friends).toBe('function');
    expect(typeof result.enemies).toBe('function');
    expect(typeof result.location).toBe('function');
    expect(typeof result.favoritePlace).toBe('function');
  });

  test('should create resolver for type', () => {
    const personConfig = {} as TangibleEntityConfig;
    const placeConfig: TangibleEntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name', type: 'textFields' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          config: personConfig,
          type: 'duplexFields',
        },
        {
          name: 'visitors',
          oppositeName: 'favoritePlace',
          array: true,
          config: personConfig,
          type: 'duplexFields',
        },
      ],
    };
    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          required: true,
          type: 'textFields',
        },
        {
          name: 'lastName',
          required: true,
          type: 'textFields',
        },
      ],
      duplexFields: [
        {
          name: 'friends',
          oppositeName: 'friends',
          config: personConfig,
          array: true,
          required: true,
          type: 'duplexFields',
        },
        {
          name: 'enemies',
          oppositeName: 'enemies',
          array: true,
          config: personConfig,
          type: 'duplexFields',
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
          type: 'duplexFields',
        },
        {
          name: 'favoritePlace',
          oppositeName: 'visitors',
          config: placeConfig,
          type: 'duplexFields',
        },
      ],
    });

    const serversideConfig: ServersideConfig = {};

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Place: placeConfig, Person: personConfig },
    };

    const result = composeEntityResolvers(personConfig, generalConfig, serversideConfig);

    expect(typeof result.friends).toBe('function');
    expect(typeof result.enemies).toBe('function');
    expect(typeof result.location).toBe('function');
    expect(typeof result.favoritePlace).toBe('function');
  });
  test('should create resolver for type', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Place',
      type: 'tangible',
      geospatialFields: [
        {
          name: 'position',
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
        {
          name: 'positions',
          geospatialType: 'Point',
          array: true,
          type: 'geospatialFields',
        },
        {
          name: 'area',
          geospatialType: 'Polygon',
          type: 'geospatialFields',
        },
        {
          name: 'areas',
          geospatialType: 'Polygon',
          array: true,
          type: 'geospatialFields',
        },
      ],
    };

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Place: entityConfig },
    };

    const serversideConfig: Record<string, any> = {};

    const result = composeEntityResolvers(entityConfig, generalConfig, serversideConfig);

    expect(typeof result.position).toBe('function');
    expect(typeof result.positions).toBe('function');
    expect(typeof result.area).toBe('function');
    expect(typeof result.areas).toBe('function');
  });
});

describe('composeEntityResolvers: "slice" of calculated array fields', () => {
  const entityConfig: TangibleEntityConfig = {
    name: 'Container',
    type: 'tangible',
    calculatedFields: [
      { name: 'names', calculatedType: 'textFields', type: 'calculatedFields', array: true },
      {
        name: 'remoteNames',
        calculatedType: 'textFields',
        type: 'calculatedFields',
        array: true,
        async: true,
      },
    ],
  };

  const generalConfig: GeneralConfig = { allEntityConfigs: { Container: entityConfig } };

  // "asyncFunc" returns a value per entity: of the list in a root resolver, of [entity] otherwise
  const asyncFunc = jest.fn(async (args, resolverCreatorArg, resolverArg, entity) => [
    entity.values,
  ]);

  const syncFunc = jest.fn((args, data) => data.values);

  const asyncFuncFunc = jest.fn(
    (args, data, resolverArg, asyncFuncResult, index) => asyncFuncResult[index],
  );

  const serversideConfig: ServersideConfig = {
    calculatedFields: {
      Container: {
        names: { func: syncFunc },
        remoteNames: { asyncFunc, func: asyncFuncFunc },
      },
    },
  };

  const resolvers = composeEntityResolvers(entityConfig, generalConfig, serversideConfig);

  const rootResolverArg = {
    parent: null,
    args: {},
    context: {},
    info: { projection: {}, fieldArgs: {}, path: [] },
    resolverOptions: { involvedFilters: {} },
  } as any;

  const composeParents: Record<string, (name: string, values: any) => any> = {
    materialized: (name, values) => ({ [name]: values }),
    'hidden context': (name, values) =>
      attachCalculatedContext(
        { values },
        { asyncFuncResults: { remoteNames: [values] }, index: 0, resolverArg: rootResolverArg },
      ),
    fallback: (name, values) => ({ values }),
  };

  const values = ['a', 'b', 'c'];

  const cases: [string, any, any, any][] = [
    ['without "slice"', values, {}, values],
    ['"begin"', values, { slice: { begin: 1 } }, ['b', 'c']],
    ['"end"', values, { slice: { end: 1 } }, ['a']],
    ['"begin" & "end"', values, { slice: { begin: 1, end: 2 } }, ['b']],
    ['"func" returns []', [], { slice: { begin: 1, end: 2 } }, []],
    ['"func" returns null', null, { slice: { begin: 1, end: 2 } }, null],
  ];

  beforeEach(() => {
    asyncFunc.mockClear();
    syncFunc.mockClear();
    asyncFuncFunc.mockClear();
  });

  describe.each(Object.keys(composeParents))('%s', (branch) => {
    describe.each(['names', 'remoteNames'])('%s', (name) => {
      test.each(cases)('%s', async (title, funcValue, args, expected) => {
        const parent = composeParents[branch](name, funcValue);

        await expect(
          Promise.resolve(resolvers[name](parent, args, {}, { fieldName: name })),
        ).resolves.toEqual(expected);

        if (branch === 'materialized') return;

        // "func" gets the args as is: slicing is not its job
        const func = name === 'names' ? syncFunc : asyncFuncFunc;
        expect(func).toHaveBeenCalledTimes(1);
        expect(func.mock.calls[0][0]).toEqual(args);
      });
    });
  });

  test('every entity of a list is sliced from its own "asyncFuncResult[index]"', async () => {
    const asyncFuncResults = {
      remoteNames: [
        ['a', 'b', 'c'],
        ['d', 'e'],
      ],
    };

    const parents = [0, 1].map((index) =>
      attachCalculatedContext({}, { asyncFuncResults, index, resolverArg: rootResolverArg }),
    );

    const results = parents.map((parent) =>
      resolvers.remoteNames(parent, { slice: { begin: 1 } }, {}, { fieldName: 'remoteNames' }),
    );

    expect(results).toEqual([['b', 'c'], ['e']]);
    expect(asyncFuncFunc.mock.calls.map(([, , , , index]) => index)).toEqual([0, 1]);
  });

  test('fallback: different slices of a field share one "asyncFunc" call', async () => {
    const parent = { values };

    const info = { fieldName: 'remoteNames' };

    await expect(resolvers.remoteNames(parent, { slice: { end: 1 } }, {}, info)).resolves.toEqual([
      'a',
    ]);

    await expect(resolvers.remoteNames(parent, { slice: { begin: 2 } }, {}, info)).resolves.toEqual(
      ['c'],
    );

    await expect(resolvers.remoteNames(parent, {}, {}, info)).resolves.toEqual(values);

    expect(asyncFunc).toHaveBeenCalledTimes(1);
  });
});
