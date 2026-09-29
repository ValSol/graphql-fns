import mongoose from 'mongoose';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import type { GeneralConfig, Inventory, SimplifiedEntityConfig } from '@/tsTypes';

import mongoOptions from '@/test/mongo-options';
import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import composeTypeDefsAndResolvers from '@/composeTypeDefsAndResolvers';
import addChildActions from './addChildActions';

// Relation fields listed in "include" only through root queries work after "addChildActions".

const declarations: SimplifiedEntityConfig[] = [
  {
    name: 'Country',
    type: 'tangible',
    textFields: [{ name: 'code', unique: true }],
    duplexFields: [
      { name: 'cities', oppositeName: 'country', array: true, configName: 'City', parent: true },
    ],
  },
  {
    name: 'City',
    type: 'tangible',
    textFields: [{ name: 'name' }],
    duplexFields: [{ name: 'country', oppositeName: 'cities', configName: 'Country' }],
  },
];

const allEntityConfigs = composeAllEntityConfigs(declarations);

// no subscriptions, so no "pubsub" is needed
const inventory: Inventory = {
  name: 'G',
  include: {
    Query: { entity: ['Country', 'City'], entities: ['Country', 'City'] },
    Mutation: { createEntity: ['Country'] },
  },
};

const composeSchema = (inventory2: Inventory) => {
  const generalConfig: GeneralConfig = { allEntityConfigs, inventory: inventory2 };
  const { typeDefs, resolvers } = composeTypeDefsAndResolvers(generalConfig, {});

  return makeExecutableSchema({ typeDefs, resolvers });
};

let mongooseConn;

const run = (schema, source: string) => graphql({ schema, source, contextValue: { mongooseConn } });

mongoose.set('strictQuery', false);

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-add-child-actions';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('addChildActions', () => {
  const source = '{ Countries { code cities { name country { code } } } }';

  test('relation fields are absent without child queries', async () => {
    const { errors } = await run(composeSchema(inventory), source);

    expect(errors?.[0].message).toBe('Cannot query field "cities" on type "Country".');
  });

  test('relation fields are queried with added child queries', async () => {
    const schema = composeSchema(addChildActions(inventory, { allEntityConfigs }));

    const created = await run(
      schema,
      'mutation { createCountry(data: { code: "UA", cities: { create: [{ name: "Kyiv" }, { name: "Lviv" }] } }) { id } }',
    );

    expect(created.errors).toBeUndefined();

    const { data, errors } = await run(schema, source);

    expect(errors).toBeUndefined();

    expect(data).toEqual({
      Countries: [
        {
          code: 'UA',
          cities: [
            { name: 'Kyiv', country: { code: 'UA' } },
            { name: 'Lviv', country: { code: 'UA' } },
          ],
        },
      ],
    });
  });
});
