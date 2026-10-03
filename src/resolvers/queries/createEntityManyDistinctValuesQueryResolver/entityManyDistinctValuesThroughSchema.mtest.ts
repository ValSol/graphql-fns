import mongoose from 'mongoose';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import type { GeneralConfig, SimplifiedEntityConfig } from '@/tsTypes';

import mongoOptions from '@/test/mongo-options';
import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import composeTypeDefsAndResolvers from '@/composeTypeDefsAndResolvers';

// "XManyDistinctValues" through the schema of an inventory that allows this query only: ...
// ... the schema has no other actions, global ids in "where" of the items, relational "where", "search"

const declarations: SimplifiedEntityConfig[] = [
  {
    name: 'Country',
    type: 'tangible',
    textFields: [{ name: 'code', unique: true, weight: 1 }],
    duplexFields: [
      { name: 'cities', oppositeName: 'country', array: true, configName: 'City', parent: true },
    ],
  },
  {
    name: 'City',
    type: 'tangible',
    textFields: [
      { name: 'name', index: true },
      { name: 'tags', array: true, index: true },
      { name: 'description' },
    ],
    duplexFields: [{ name: 'country', oppositeName: 'cities', configName: 'Country', index: true }],
  },
  // has no targets, so it has no "TagManyDistinctValues"
  { name: 'Tag', type: 'tangible', textFields: [{ name: 'title' }] },
];

const allEntityConfigs = composeAllEntityConfigs(declarations);

// no subscriptions, so no "pubsub" is needed
const generalConfig: GeneralConfig = {
  allEntityConfigs,
  inventory: { name: 'G', include: { Query: { entityManyDistinctValues: true } } },
};

const { typeDefs, resolvers } = composeTypeDefsAndResolvers(generalConfig, {});

const schema = makeExecutableSchema({ typeDefs, resolvers });

// full schema (same collections) only to create the data
const fullSchema = (() => {
  const composed = composeTypeDefsAndResolvers(
    { allEntityConfigs, inventory: { name: 'Full', exclude: { Subscription: true } } },
    {},
  );

  return makeExecutableSchema(composed);
})();

let mongooseConn;

const run = (source: string) => graphql({ schema, source, contextValue: { mongooseConn } });

const runFull = (source: string) =>
  graphql({ schema: fullSchema, source, contextValue: { mongooseConn } });

mongoose.set('strictQuery', false);

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entity-many-distinct-values-through-schema';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('entityManyDistinctValues through schema', () => {
  test('should compose schema with "XManyDistinctValues" only', () => {
    expect(Object.keys(schema.getQueryType()?.getFields() ?? {}).sort()).toEqual([
      'CityManyDistinctValues',
      'CountryManyDistinctValues',
      'node',
    ]);

    expect(schema.getMutationType()).toBeUndefined();
    expect(schema.getSubscriptionType()).toBeUndefined();

    // every declaration of the schema: the query inputs of "where" (with the inputs of their ...
    // ... relational filters "x_"), the items, the enums of targets and the restricted "where" ...
    // ... (without "x_"); no inputs of other actions, no entity types (the query returns scalars)
    const expectedTypeDefs = `scalar DateTime
scalar Upload
interface Node {
  id: ID!
}
input RegExp {
  pattern: String!
  flags: String
}
input SliceInput {
  begin: Int
  end: Int
}

input CountryWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  code_in: [String!]
  code_nin: [String!]
  code_ne: String
  code_gt: String
  code_gte: String
  code_lt: String
  code_lte: String
  code_re: [RegExp!]
  AND: [CountryWhereInput!]
  NOR: [CountryWhereInput!]
  OR: [CountryWhereInput!]
}
input CountryWhereWithoutBooleanOperationsInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  code_in: [String!]
  code_nin: [String!]
  code_ne: String
  code_gt: String
  code_gte: String
  code_lt: String
  code_lte: String
  code_re: [RegExp!]
}
input CityWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  name: String
  name_in: [String!]
  name_nin: [String!]
  name_ne: String
  name_gt: String
  name_gte: String
  name_lt: String
  name_lte: String
  name_re: [RegExp!]
  name_exists: Boolean
  tags: String
  tags_in: [String!]
  tags_nin: [String!]
  tags_ne: String
  tags_gt: String
  tags_gte: String
  tags_lt: String
  tags_lte: String
  tags_re: [RegExp!]
  tags_size: Int
  tags_notsize: Int
  country: ID
  country_in: [ID!]
  country_nin: [ID!]
  country_ne: ID
  country_: CountryWhereWithoutBooleanOperationsInput
  country_exists: Boolean
  AND: [CityWhereInput!]
  NOR: [CityWhereInput!]
  OR: [CityWhereInput!]
}
input CityWhereWithoutBooleanOperationsInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  name: String
  name_in: [String!]
  name_nin: [String!]
  name_ne: String
  name_gt: String
  name_gte: String
  name_lt: String
  name_lte: String
  name_re: [RegExp!]
  name_exists: Boolean
  tags: String
  tags_in: [String!]
  tags_nin: [String!]
  tags_ne: String
  tags_gt: String
  tags_gte: String
  tags_lt: String
  tags_lte: String
  tags_re: [RegExp!]
  tags_size: Int
  tags_notsize: Int
  country: ID
  country_in: [ID!]
  country_nin: [ID!]
  country_ne: ID
  country_: CountryWhereWithoutBooleanOperationsInput
  country_exists: Boolean
}
input CountryRestrictedWhereAndTargetInput {
  target: CountryTextNamesEnum!
  where: CountryRestrictedWhereInput
}
enum CountryTextNamesEnum {
  code
}
input CountryRestrictedWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  code_in: [String!]
  code_nin: [String!]
  code_ne: String
  code_gt: String
  code_gte: String
  code_lt: String
  code_lte: String
  code_re: [RegExp!]
  AND: [CountryRestrictedWhereInput!]
  NOR: [CountryRestrictedWhereInput!]
  OR: [CountryRestrictedWhereInput!]
}
input CityRestrictedWhereAndTargetInput {
  target: CityTextNamesEnum!
  where: CityRestrictedWhereInput
}
enum CityTextNamesEnum {
  name
  tags
}
input CityRestrictedWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  name: String
  name_in: [String!]
  name_nin: [String!]
  name_ne: String
  name_gt: String
  name_gte: String
  name_lt: String
  name_lte: String
  name_re: [RegExp!]
  name_exists: Boolean
  tags: String
  tags_in: [String!]
  tags_nin: [String!]
  tags_ne: String
  tags_gt: String
  tags_gte: String
  tags_lt: String
  tags_lte: String
  tags_re: [RegExp!]
  tags_size: Int
  tags_notsize: Int
  country: ID
  country_in: [ID!]
  country_nin: [ID!]
  country_ne: ID
  country_exists: Boolean
  AND: [CityRestrictedWhereInput!]
  NOR: [CityRestrictedWhereInput!]
  OR: [CityRestrictedWhereInput!]
}
type Query {
  node(id: ID!): Node
  CountryManyDistinctValues(where: CountryWhereInput, restrictedWhereAndTarget: [CountryRestrictedWhereAndTargetInput!]!, search: String, token: String): [[String!]!]!
  CityManyDistinctValues(where: CityWhereInput, restrictedWhereAndTarget: [CityRestrictedWhereAndTargetInput!]!, token: String): [[String!]!]!
}`;

    expect(typeDefs).toBe(expectedTypeDefs);
  });

  test('should return distinct values by items of "restrictedWhereAndTarget"', async () => {
    const created = await runFull(`mutation {
      createCountry(data: {
        code: "UA"
        cities: { create: [
          { name: "Kyiv", tags: ["capital", "big"] }
          { name: "Lviv", tags: ["big", ""] }
          { name: "Uzhhorod", tags: [] }
        ] }
      }) { id }
    }`);

    expect(created.errors).toBeUndefined();

    const created2 = await runFull(`mutation {
      createCountry(data: {
        code: "PL"
        cities: { create: [{ name: "Krakow", tags: ["big"] }, { name: "Gdansk", tags: ["port"] }] }
      }) { id }
    }`);

    expect(created2.errors).toBeUndefined();

    const uaId = (created.data as any).createCountry.id;

    const { data, errors } = await run(`{
      CityManyDistinctValues(restrictedWhereAndTarget: [
        { target: name }
        { target: tags }
        { target: name, where: { country: "${uaId}" } }
        { target: tags, where: { name_in: ["Lviv", "Uzhhorod"] } }
        { target: name, where: { tags: "port", country: "${uaId}" } }
      ])
      relational: CityManyDistinctValues(
        where: { country_: { code_in: ["PL"] } }
        restrictedWhereAndTarget: [{ target: name }, { target: tags, where: { name: "Krakow" } }]
      )
      CountryManyDistinctValues(search: "UA", restrictedWhereAndTarget: [{ target: code }])
      empty: CountryManyDistinctValues(restrictedWhereAndTarget: [])
    }`);

    expect(errors).toBeUndefined();

    expect(data).toEqual({
      CityManyDistinctValues: [
        ['Gdansk', 'Krakow', 'Kyiv', 'Lviv', 'Uzhhorod'],
        ['big', 'capital', 'port'],
        ['Kyiv', 'Lviv', 'Uzhhorod'],
        ['big'],
        [],
      ],
      relational: [['Gdansk', 'Krakow'], ['big']],
      CountryManyDistinctValues: [['UA']],
      empty: [],
    });
  });

  test('should not allow other actions', async () => {
    const { errors } = await run('{ Cities { id } }');

    expect(errors?.[0].message).toMatch(/Cannot query field "Cities" on type "Query"/);

    const { errors: errors2 } = await run('{ CityDistinctValues(options: { target: name }) }');

    expect(errors2?.[0].message).toMatch(/Cannot query field "CityDistinctValues"/);
  });
});
