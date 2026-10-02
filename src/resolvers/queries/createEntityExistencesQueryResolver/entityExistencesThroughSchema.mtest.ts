import mongoose from 'mongoose';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import type { GeneralConfig, SimplifiedEntityConfig } from '@/tsTypes';

import mongoOptions from '@/test/mongo-options';
import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import composeTypeDefsAndResolvers from '@/composeTypeDefsAndResolvers';
import composeQueryResolver from '@/resolvers/utils/composeQueryResolver';
import createInfoEssence from '@/resolvers/utils/createInfoEssence';
import fromGlobalId from '@/resolvers/utils/fromGlobalId';

// "XExistences" through the schema: default "where", global ids in "where" of the items, "search"; ...
// ... and the raw resolver got by "composeQueryResolver('X_Existences', …)" (mongo ids)

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
    textFields: [{ name: 'name', index: true }],
    duplexFields: [{ name: 'country', oppositeName: 'cities', configName: 'Country', index: true }],
  },
];

const allEntityConfigs = composeAllEntityConfigs(declarations);

// no subscriptions, so no "pubsub" is needed
const generalConfig: GeneralConfig = {
  allEntityConfigs,
  inventory: { name: 'G', exclude: { Subscription: true } },
};

const { typeDefs, resolvers } = composeTypeDefsAndResolvers(generalConfig, {});

const schema = makeExecutableSchema({ typeDefs, resolvers });

let mongooseConn;

const run = (source: string) => graphql({ schema, source, contextValue: { mongooseConn } });

mongoose.set('strictQuery', false);

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entity-existences-through-schema';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('entityExistences through schema', () => {
  test('should check existences by pairs of "where" and "search"', async () => {
    const created = await run(
      'mutation { createCountry(data: { code: "UA", cities: { create: [{ name: "Kyiv" }, { name: "Lviv" }] } }) { id } }',
    );

    expect(created.errors).toBeUndefined();

    const created2 = await run('mutation { createCountry(data: { code: "PL" }) { id } }');

    expect(created2.errors).toBeUndefined();

    const uaId = (created.data as any).createCountry.id;
    const plId = (created2.data as any).createCountry.id;

    const { data, errors } = await run(`{
      CityExistences(whereAndSearch: [
        {}
        { where: { name: "Kyiv" } }
        { where: { name: "Odesa" } }
        { where: { country: "${uaId}" } }
        { where: { country: "${plId}" } }
        { where: { country_: { code_in: ["UA"] }, name: "Lviv" } }
      ])
      CountryExistences(whereAndSearch: [
        { search: "UA" }
        { where: { id_in: ["${plId}"] }, search: "UA" }
        { where: { id_in: ["${plId}"] } }
        { search: "DE" }
      ])
    }`);

    expect(errors).toBeUndefined();

    expect(data).toEqual({
      CityExistences: [true, true, false, true, false, true],
      CountryExistences: [true, false, true, false],
    });
  });

  test('should check existences by raw resolver of "composeQueryResolver"', async () => {
    const { data } = await run('{ Countries(where: { code_in: ["UA"] }) { id } }');

    const { _id: uaId } = fromGlobalId((data as any).Countries[0].id);

    const cityExistences = composeQueryResolver('City_Existences', generalConfig, {});

    const result = await cityExistences(
      null,
      {
        whereAndSearch: [
          {},
          { where: { country: uaId } },
          { where: { country: uaId, name: 'Odesa' } },
          { where: { country_: { code_in: ['PL'] } } },
        ],
      },
      { mongooseConn },
      createInfoEssence({ projection: { _id: 1 } }),
      { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
    );

    expect(result).toEqual([true, true, false, false]);
  });
});
