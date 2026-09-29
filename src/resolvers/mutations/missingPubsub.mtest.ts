import mongoose from 'mongoose';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import type { GeneralConfig, ServersideConfig, SimplifiedEntityConfig } from '@/tsTypes';

import mongoOptions from '@/test/mongo-options';
import pubsub from '@/resolvers/utils/pubsub';
import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import composeTypeDefsAndResolvers from '@/composeTypeDefsAndResolvers';
import workOutMutations from './workOutMutations';

// Without "pubsub" in context a mutation that reports to subscriptions has to fail before any write.

const declarations: SimplifiedEntityConfig[] = [
  {
    name: 'Country',
    type: 'tangible',
    textFields: [
      { name: 'code', unique: true },
      { name: 'tags', array: true },
    ],
  },
];

const allEntityConfigs = composeAllEntityConfigs(declarations);
const generalConfig: GeneralConfig = { allEntityConfigs };
const serversideConfig: ServersideConfig = {};

// without inventory the schema has all subscriptions
const { typeDefs, resolvers } = composeTypeDefsAndResolvers(generalConfig, serversideConfig);
const schema = makeExecutableSchema({ typeDefs, resolvers });

let mongooseConn;

const run = async (source: string, withPubsub: boolean) => {
  const contextValue = withPubsub ? { mongooseConn, pubsub } : { mongooseConn };

  return graphql({ schema, source, contextValue });
};

const readCountries = async () => {
  const { data, errors } = await run('{ Countries { code tags } }', false);

  if (errors) throw errors[0];

  return data?.Countries;
};

const pubsubError = `PubSub not found! If you don't use "Subscription" exclude it in "inventory"!`;

mongoose.set('strictQuery', false);

let countryId: string;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-missing-pubsub';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  const { data, errors } = await run(
    'mutation { createCountry(data: { code: "UA", tags: ["a"] }) { id } }',
    true,
  );

  if (errors) throw errors[0];

  countryId = (data?.createCountry as { id: string }).id;
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('mutations without "pubsub"', () => {
  const initialCountries = [{ code: 'UA', tags: ['a'] }];

  test.each([
    ['createCountry', () => 'mutation { createCountry(data: { code: "PL" }) { id } }'],
    [
      'updateCountry',
      () =>
        `mutation { updateCountry(whereOne: { id: "${countryId}" }, data: { code: "PL" }) { id } }`,
    ],
    ['deleteCountry', () => `mutation { deleteCountry(whereOne: { id: "${countryId}" }) { id } }`],
    [
      'pushIntoCountry',
      () =>
        `mutation { pushIntoCountry(whereOne: { id: "${countryId}" }, data: { tags: ["b"] }) { id } }`,
    ],
  ])('"%s" should fail without changes in database', async (actionName, composeSource) => {
    const { errors } = await run(composeSource(), false);

    expect(errors?.[0].message).toBe(pubsubError);

    expect(await readCountries()).toEqual(initialCountries);
  });

  test('"workOutMutations" should fail without changes in database', async () => {
    const standardMutationsArgs = [
      {
        actionGeneralName: 'updateEntity',
        entityConfig: allEntityConfigs.Country,
        args: { whereOne: { id: countryId }, data: { code: 'PL' } },
        returnResult: true,
      },
      {
        actionGeneralName: 'createEntity',
        entityConfig: allEntityConfigs.Country,
        args: { data: { code: 'DE' } },
        returnResult: true,
        returnReport: true,
        resolverOptions: {
          involvedFilters: { inputOutputFilterAndLimit: [[]] },
          subscriptionEntityNames: { subscriptionCreatedEntityName: 'Country' },
        },
      },
    ];

    await expect(
      workOutMutations(standardMutationsArgs as any, {
        generalConfig,
        serversideConfig,
        context: { mongooseConn },
      }),
    ).rejects.toThrow(pubsubError);

    expect(await readCountries()).toEqual(initialCountries);
  });

  test('"workOutMutations" without reports should not require "pubsub"', async () => {
    const standardMutationsArgs = [
      {
        actionGeneralName: 'createEntity',
        entityConfig: allEntityConfigs.Country,
        args: { data: { code: 'DE' } },
        returnResult: true,
      },
    ];

    const [created] = await workOutMutations(standardMutationsArgs, {
      generalConfig,
      serversideConfig,
      context: { mongooseConn },
    });

    expect(created.code).toBe('DE');

    await workOutMutations(
      [
        {
          actionGeneralName: 'deleteEntity',
          entityConfig: allEntityConfigs.Country,
          args: { whereOne: { id: created.id } },
          returnResult: false,
        },
      ],
      { generalConfig, serversideConfig, context: { mongooseConn } },
    );

    expect(await readCountries()).toEqual(initialCountries);
  });
});
