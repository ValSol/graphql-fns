import mongoose from 'mongoose';

import type { GeneralConfig, ServersideConfig, SimplifiedEntityConfig } from '@/tsTypes';

import mongoOptions from '@/test/mongo-options';
import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import createCreateEntityMutationResolver from '@/resolvers/mutations/createCreateEntityMutationResolver';
import createDeleteEntityMutationResolver from '@/resolvers/mutations/createDeleteEntityMutationResolver';
import createUpdateEntityMutationResolver from '@/resolvers/mutations/createUpdateEntityMutationResolver';
import workOutMutations from '@/resolvers/mutations/workOutMutations';
import createInfoEssence from '../createInfoEssence';
import composeSubscriptionReportArgs from '../composeSubscriptionReportArgs';
import withSubscriptionReport from '.';

// Raw mutation resolvers called from your own code publish their events only with the help of these helpers.

const declarations: SimplifiedEntityConfig[] = [
  {
    name: 'Country',
    textFields: [{ name: 'code', unique: true }, { name: 'name' }],
    intFields: [{ name: 'population' }],
  },
];

const allEntityConfigs = composeAllEntityConfigs(declarations);
const { Country } = allEntityConfigs as any;

const generalConfig: GeneralConfig = { allEntityConfigs };
const serversideConfig: ServersideConfig = {};

const resolverOptions = { involvedFilters: { inputOutputFilterAndLimit: [[]] as [[]] } };

// the selection of a client that asked only for the population
const clientInfo = createInfoEssence({ projection: { population: 1 } });

let mongooseConn;

const createRecordingPubsub = () => {
  const published: Array<[string, any]> = [];

  return {
    published,
    publish: (channel: string, payload: any) => published.push([channel, payload]),
  };
};

const composeResolvers = (generalConfig2: GeneralConfig) => ({
  createCountry: withSubscriptionReport(
    createCreateEntityMutationResolver(Country, generalConfig2, serversideConfig, true)!,
    'created',
    Country,
    generalConfig2,
  ),
  updateCountry: withSubscriptionReport(
    createUpdateEntityMutationResolver(Country, generalConfig2, serversideConfig, true)!,
    'updated',
    Country,
    generalConfig2,
  ),
  deleteCountry: withSubscriptionReport(
    createDeleteEntityMutationResolver(Country, generalConfig2, serversideConfig, true)!,
    'deleted',
    Country,
    generalConfig2,
  ),
});

mongoose.set('strictQuery', false);

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-with-subscription-report';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongooseConn.connection.close();
});

describe('withSubscriptionReport', () => {
  test('should publish "created", "updated" & "deleted" events like the generated mutations', async () => {
    const pubsub = createRecordingPubsub();
    const context = { mongooseConn, pubsub };
    const { createCountry, updateCountry, deleteCountry } = composeResolvers(generalConfig);

    const created: any = await createCountry(
      null,
      { data: { code: 'UA', name: 'Ukraine', population: 41000000 } },
      context,
      clientInfo,
      resolverOptions,
    );

    const updated: any = await updateCountry(
      null,
      { whereOne: { id: created.id }, data: { population: 41001000 } },
      context,
      clientInfo,
      resolverOptions,
    );

    // the result keeps the selection of the client
    expect(updated.population).toBe(41001000);

    await deleteCountry(
      null,
      { whereOne: { id: created.id } },
      context,
      clientInfo,
      resolverOptions,
    );

    expect(pubsub.published.map(([channel]) => channel)).toEqual([
      'created-Country',
      'updated-Country',
      'deleted-Country',
    ]);

    const [, [, updatedPayload], [, deletedPayload]] = pubsub.published;

    // all fields, though the client selected only the population
    expect(updatedPayload.updatedCountry.previousNode).toEqual(
      expect.objectContaining({ code: 'UA', name: 'Ukraine', population: 41000000 }),
    );
    expect(updatedPayload.updatedCountry.node).toEqual(
      expect.objectContaining({ code: 'UA', name: 'Ukraine', population: 41001000 }),
    );
    expect(updatedPayload.updatedCountry.updatedFields).toEqual(['population', 'updatedAt']);

    expect(deletedPayload.deletedCountry.node).toEqual(
      expect.objectContaining({ code: 'UA', name: 'Ukraine', population: 41001000 }),
    );
  });

  test('should not publish without the helper', async () => {
    const pubsub = createRecordingPubsub();

    const createCountry = createCreateEntityMutationResolver(
      Country,
      generalConfig,
      serversideConfig,
      true,
    )!;

    await createCountry(
      null,
      { data: { code: 'PL' } },
      { mongooseConn, pubsub },
      clientInfo,
      resolverOptions,
    );

    expect(pubsub.published).toEqual([]);
  });

  test('should neither publish nor require "pubsub" if the subscription is excluded by inventory', async () => {
    const generalConfig2: GeneralConfig = {
      allEntityConfigs,
      inventory: { name: 'test', exclude: { Subscription: true } },
    };

    const { createCountry } = composeResolvers(generalConfig2);

    const created: any = await createCountry(
      null,
      { data: { code: 'DE' } },
      { mongooseConn },
      createInfoEssence({ projection: { code: 1 } }),
      resolverOptions,
    );

    expect(created.code).toBe('DE');
  });
});

describe('composeSubscriptionReportArgs', () => {
  test('should make "workOutMutations" publish complete events', async () => {
    const pubsub = createRecordingPubsub();
    const context = { mongooseConn, pubsub };

    const [created] = await workOutMutations(
      [
        {
          actionGeneralName: 'createEntity',
          entityConfig: Country,
          args: { data: { code: 'FR', name: 'France', population: 68000000 } },
          returnResult: true,
        },
      ],
      { generalConfig, serversideConfig, context },
    );

    await workOutMutations(
      [
        {
          actionGeneralName: 'updateEntity',
          entityConfig: Country,
          args: { whereOne: { id: created.id }, data: { population: 68100000 } },
          ...composeSubscriptionReportArgs(
            'updated',
            Country,
            generalConfig,
            undefined,
            resolverOptions,
          ),
          returnResult: true,
          returnReport: true,
        },
      ],
      { generalConfig, serversideConfig, context },
    );

    expect(pubsub.published).toHaveLength(1);

    const [[channel, payload]] = pubsub.published;

    expect(channel).toBe('updated-Country');
    expect(payload.updatedCountry.previousNode).toEqual(
      expect.objectContaining({ code: 'FR', name: 'France', population: 68000000 }),
    );
    expect(payload.updatedCountry.updatedFields).toEqual(['population', 'updatedAt']);
  });

  test('should keep the arguments if the subscription is excluded by inventory', () => {
    const generalConfig2: GeneralConfig = {
      allEntityConfigs,
      inventory: { name: 'test', exclude: { Subscription: { updatedEntity: ['Country'] } } },
    };

    expect(
      composeSubscriptionReportArgs(
        'updated',
        Country,
        generalConfig2,
        clientInfo,
        resolverOptions,
      ),
    ).toEqual({ info: clientInfo, resolverOptions });

    expect(
      composeSubscriptionReportArgs(
        'created',
        Country,
        generalConfig2,
        clientInfo,
        resolverOptions,
      ),
    ).toEqual({
      info: clientInfo,
      resolverOptions: {
        ...resolverOptions,
        subscriptionEntityNames: { subscriptionCreatedEntityName: 'Country' },
      },
    });
  });
});
