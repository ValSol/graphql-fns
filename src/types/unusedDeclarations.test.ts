import type {
  ActionSignatureMethods,
  GeneralConfig,
  Inventory,
  ObjectSignatureMethods,
  RepresentationAttributes,
  SimplifiedEntityConfig,
} from '@/tsTypes';

import findUnreachableDeclarations from '@/test/findUnreachableDeclarations';
import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import { mutationAttributes, queryAttributes, subscriptionAttributes } from './actionAttributes';
import composeGqlTypes from './composeGqlTypes';

const enums = { Continent: ['EUROPE', 'ASIA'] };

const simplifiedEntityConfigs: SimplifiedEntityConfig[] = [
  { name: 'Address', type: 'embedded', textFields: [{ name: 'street', index: true }] },
  {
    name: 'Country',
    textFields: [{ name: 'code', unique: true, weight: 1 }],
    enumFields: [{ name: 'continent', enumName: 'Continent', index: true }],
    geospatialFields: [
      { name: 'center', geospatialType: 'Point', index: true },
      { name: 'area', geospatialType: 'Polygon' },
      { name: 'border', geospatialType: 'MultiLineString' },
    ],
    duplexFields: [
      { name: 'cities', oppositeName: 'country', array: true, configName: 'City', parent: true },
    ],
  },
  {
    name: 'City',
    textFields: [
      { name: 'name', index: true },
      { name: 'tags', array: true, index: true },
      { name: 'description' },
    ],
    duplexFields: [
      // indexed & required (with "Thru" inputs)
      { name: 'country', oppositeName: 'cities', configName: 'Country', index: true, required: true },
      // not indexed
      { name: 'capitalOf', oppositeName: 'capital', configName: 'Region' },
    ],
    relationalFields: [
      // indexed (parent relational field "cities" of "Region" gets "cities_")
      { name: 'region', oppositeName: 'cities', configName: 'Region', index: true },
      // not indexed (parent relational field "cities" of "Tag" gets nothing)
      { name: 'tag', oppositeName: 'cities', configName: 'Tag' },
    ],
    embeddedFields: [
      {
        name: 'addresses',
        configName: 'Address',
        array: true,
        index: true,
        variants: ['plain', 'connection', 'count'],
      },
      { name: 'mainAddress', configName: 'Address' },
    ],
  },
  {
    name: 'Region',
    textFields: [{ name: 'title', index: true }],
    duplexFields: [{ name: 'capital', oppositeName: 'capitalOf', configName: 'City' }],
  },
  { name: 'Tag', textFields: [{ name: 'title' }] },
];

const allEntityConfigs = composeAllEntityConfigs(simplifiedEntityConfigs, enums);

// configs with "copy…" actions (the clone of "Menu" is "MenuClone")
const copyEntityConfigs = composeAllEntityConfigs([
  {
    name: 'Menu',
    textFields: [{ name: 'name', required: true, index: true }],
    duplexFields: [
      { name: 'clone', oppositeName: 'original', configName: 'MenuClone', parent: true },
      {
        name: 'sections',
        oppositeName: 'menu',
        array: true,
        configName: 'MenuSection',
        parent: true,
      },
    ],
  },
  {
    name: 'MenuClone',
    textFields: [{ name: 'name', required: true }],
    duplexFields: [
      { name: 'original', oppositeName: 'clone', configName: 'Menu' },
      {
        name: 'sections',
        oppositeName: 'menu',
        array: true,
        configName: 'MenuCloneSection',
        parent: true,
      },
    ],
  },
  {
    name: 'MenuSection',
    textFields: [{ name: 'name', required: true, index: true }],
    duplexFields: [{ name: 'menu', oppositeName: 'sections', configName: 'Menu', required: true }],
  },
  {
    name: 'MenuCloneSection',
    textFields: [{ name: 'name', required: true }],
    duplexFields: [{ name: 'menu', oppositeName: 'sections', configName: 'MenuClone' }],
  },
]);

const ForCatalog: RepresentationAttributes = {
  allow: {
    City: ['entities', 'entity', 'updateEntity', 'childEntities', 'childEntity'],
    Country: ['entity', 'childEntity'],
    Region: ['childEntity', 'childEntities'],
    Tag: ['childEntity', 'childEntities'],
  },
  representationKey: 'ForCatalog',
  addFields: { City: { intFields: [{ name: 'population', index: true }] } },
};

const representations = { ForCatalog };

const entityPeriodInput: ObjectSignatureMethods = {
  name: 'entityPeriodInput',
  specificName: ({ name }) => `${name}PeriodInput`,
  fieldNames: () => ['start', 'end'],
  fieldTypes: () => ['DateTime!', 'DateTime'],
};

// custom query that uses inputs found by "fillInputDicForCustom"
const findEntity: ActionSignatureMethods = {
  name: 'findEntity',
  specificName: ({ name, type }) => (type === 'tangible' ? `find${name}` : ''),
  argNames: () => ['where', 'period', 'child', 'thru'],
  argTypes: ({ name }) => [
    `${name}WhereWithoutBooleanOperationsInput`,
    `${name}PeriodInput`,
    `${name}CreateChildInput`,
    name === 'City' ? 'CityCreateThru_country_FieldChildInput' : `${name}CreateChildInput`,
  ],
  involvedEntityNames: ({ name }) => ({ inputOutputEntity: name }),
  type: ({ name }) => `[${name}!]!`,
  config: (entityConfig) => entityConfig,
};

const custom = { Input: { entityPeriodInput }, Query: { findEntity } };

const actionKinds = [
  ['Query', queryAttributes],
  ['Mutation', mutationAttributes],
  ['Subscription', subscriptionAttributes],
] as const;

const singleActionInventories: Inventory[] = actionKinds.flatMap(([kind, attributes]) =>
  Object.keys(attributes).map((actionName) => ({
    name: `only ${actionName}`,
    include: { [kind]: { [actionName]: true } },
  })),
);

describe('generated typeDefs have no unreachable declarations', () => {
  test('for the full schema', () => {
    const generalConfig: GeneralConfig = { allEntityConfigs, enums };

    const { typeDefs } = composeGqlTypes(generalConfig);

    expect(findUnreachableDeclarations(typeDefs)).toEqual([]);
  });

  test.each(
    singleActionInventories
      .filter(({ name }) => !name.startsWith('only copy')) // there are no clones in "allEntityConfigs"
      .map((inventory) => [inventory.name, inventory]),
  )('for the schema with %s', (foo, inventory) => {
    const generalConfig: GeneralConfig = { allEntityConfigs, enums, inventory };

    const { typeDefs } = composeGqlTypes(generalConfig);

    expect(findUnreachableDeclarations(typeDefs)).toEqual([]);
  });

  test('for the full schema with "copy…" actions', () => {
    const generalConfig: GeneralConfig = { allEntityConfigs: copyEntityConfigs };

    const { typeDefs } = composeGqlTypes(generalConfig);

    expect(typeDefs).toMatch(/\n  copyMenuClone\(/);
    expect(findUnreachableDeclarations(typeDefs)).toEqual([]);
  });

  test.each(singleActionInventories.map((inventory) => [inventory.name, inventory]))(
    'for the schema with "copy…" actions with %s',
    (foo, inventory) => {
      const generalConfig: GeneralConfig = { allEntityConfigs: copyEntityConfigs, inventory };

      const { typeDefs } = composeGqlTypes(generalConfig);

      expect(findUnreachableDeclarations(typeDefs)).toEqual([]);
    },
  );

  test('for the schema with representations', () => {
    const generalConfig: GeneralConfig = { allEntityConfigs, enums, representations };

    const { typeDefs } = composeGqlTypes(generalConfig);

    expect(typeDefs).toMatch(/\n  CitiesForCatalog\(/);
    expect(findUnreachableDeclarations(typeDefs)).toEqual([]);
  });

  test('for the schema with only one representation action', () => {
    const inventory: Inventory = { name: 'test', include: { Query: { entitiesForCatalog: true } } };

    const generalConfig: GeneralConfig = { allEntityConfigs, enums, representations, inventory };

    const { typeDefs } = composeGqlTypes(generalConfig);

    expect(findUnreachableDeclarations(typeDefs)).toEqual([]);
  });

  test('for the schema with custom inputs', () => {
    const generalConfig: GeneralConfig = { allEntityConfigs, enums, custom };

    const { typeDefs } = composeGqlTypes(generalConfig);

    expect(findUnreachableDeclarations(typeDefs)).toEqual([]);
  });

  test('for the schema with only one custom action', () => {
    const inventory: Inventory = { name: 'test', include: { Query: { findEntity: ['City'] } } };

    const generalConfig: GeneralConfig = { allEntityConfigs, enums, custom, inventory };

    const { typeDefs } = composeGqlTypes(generalConfig);

    expect(typeDefs).toMatch(
      /\n  findCity\(where: CityWhereWithoutBooleanOperationsInput, period: CityPeriodInput, child: CityCreateChildInput, thru: CityCreateThru_country_FieldChildInput\): \[City!\]!\n/,
    );
    expect(typeDefs).toMatch(/\ninput CityWhereWithoutBooleanOperationsInput {\n/);
    expect(typeDefs).toMatch(/\ninput CityCreateThru_country_FieldChildInput {\n/);
    expect(typeDefs).toMatch(/\ninput CityCreateThru_country_FieldInput {\n/);
    expect(typeDefs).not.toMatch(/\ninput CityWhereInput {\n/);
    expect(findUnreachableDeclarations(typeDefs)).toEqual([]);
  });
});
