import mongoose from 'mongoose';

import type { GeneralConfig, TangibleEntityConfig } from '@/tsTypes';

import mongoOptions from '@/test/mongo-options';
import pubsub from '@/resolvers/utils/pubsub';
import createCreateManyEntitiesMutationResolver from './createCreateManyEntitiesMutationResolver';
import createUpdateManyEntitiesMutationResolver from './createUpdateManyEntitiesMutationResolver';
import createDeleteManyEntitiesMutationResolver from './createDeleteManyEntitiesMutationResolver';

mongoose.set('strictQuery', false);

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-many-results-order';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

describe('order of the results of "...Many" mutations', () => {
  const serversideConfig = { transactions: true };

  const thingConfig: TangibleEntityConfig = {
    name: 'Thing',
    type: 'tangible',
    textFields: [{ name: 'name', unique: true, type: 'textFields' }],
  };

  const generalConfig: GeneralConfig = { allEntityConfigs: { Thing: thingConfig } };

  const resolverOptions = { involvedFilters: { inputOutputFilterAndLimit: [[]] } };

  const createMany = createCreateManyEntitiesMutationResolver(
    thingConfig,
    generalConfig,
    serversideConfig,
  );
  const updateMany = createUpdateManyEntitiesMutationResolver(
    thingConfig,
    generalConfig,
    serversideConfig,
  );
  const deleteMany = createDeleteManyEntitiesMutationResolver(
    thingConfig,
    generalConfig,
    serversideConfig,
  );

  let ids: string[] = [];

  beforeEach(async () => {
    await mongooseConn.connection.db.dropDatabase();

    const created = await createMany(
      null,
      { data: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] },
      { mongooseConn, pubsub },
      null,
      resolverOptions,
    );

    expect(created.map(({ name }) => name)).toEqual(['A', 'B', 'C']);

    ids = created.map(({ id }) => id.toString());
  });

  test('"updateManyThings" returns entities in the order of "whereOneAndData"', async () => {
    const reversedIds = [...ids].reverse();

    const updated = await updateMany(
      null,
      {
        whereOneAndData: reversedIds.map((id, i) => ({
          whereOne: { id },
          data: { name: `updated-${i}` },
        })),
      },
      { mongooseConn, pubsub },
      null,
      resolverOptions,
    );

    expect(updated.map(({ id }) => id.toString())).toEqual(reversedIds);
    expect(updated.map(({ name }) => name)).toEqual(['updated-0', 'updated-1', 'updated-2']);
  });

  test('"deleteManyThings" returns entities in the order of "whereOne"', async () => {
    const reversedIds = [...ids].reverse();

    const deleted = await deleteMany(
      null,
      { whereOne: reversedIds.map((id) => ({ id })) },
      { mongooseConn, pubsub },
      null,
      resolverOptions,
    );

    expect(deleted.map(({ id }) => id.toString())).toEqual(reversedIds);
  });
});
