/* eslint-env jest */

import mongoose from 'mongoose';

import type { EntityFilters, GeneralConfig, EntityConfig, ServersideConfig } from '@/tsTypes';

import mongoOptions from '@/test/mongo-options';
import sleep from '@/utils/sleep';
import createThingSchema from '@/mongooseModels/createThingSchema';
import createInfoEssence from '@/resolvers/utils/createInfoEssence';
import pubsub from '@/resolvers/utils/pubsub';
import createCreateEntityMutationResolver from '@/resolvers/mutations/createCreateEntityMutationResolver';
import toGlobalId from '../../utils/toGlobalId';

import createNodeQueryResolver from './index';

const info = createInfoEssence({ textField1: 1, textField3: 1, createdAt: 1 });

mongoose.set('strictQuery', false);

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-node-query';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

describe('createNodeQueryResolver', () => {
  test('should use query entity resolver', async () => {
    const getUserAttributes = async () => {
      await sleep(100);
      return { roles: ['Admin'], textField1: 'textField1' };
    };

    const filters: EntityFilters = { Example: [true, ({ textField1 }) => [{ textField1 }]] };

    const serversideConfig: ServersideConfig = { getUserAttributes, filters };

    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
          unique: true,
          type: 'textFields',
        },
        {
          name: 'textField2',
          default: 'default text',
          type: 'textFields',
        },
        {
          name: 'textField3',
          required: true,
          type: 'textFields',
        },
        {
          name: 'textField4',
          array: true,
          type: 'textFields',
        },
        {
          name: 'textField5',
          default: ['default text'],
          required: true,
          array: true,
          type: 'textFields',
        },
      ],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const exampleSchema = createThingSchema(entityConfig);
    const ExampleEntity = mongooseConn.model('Example_Thing', exampleSchema);
    await ExampleEntity.createCollection();

    await sleep(250);

    const createExample = createCreateEntityMutationResolver(
      entityConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createExample).toBe('function');
    if (!createExample) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      textField1: 'textField1',
      textField2: 'textField2',
      textField3: 'textField3',
      textField4: ['textField4'],
      textField5: ['textField5'],
    };
    const createdExample = await createExample(null, { data }, { mongooseConn, pubsub }, null, {
      involvedFilters: { inputOutputEntity: [[]] },
    });
    const { id } = createdExample;

    const node = createNodeQueryResolver(generalConfig, serversideConfig);
    if (!node) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const globalId = toGlobalId(id, 'Example');
    const example = await node(null, { id: globalId }, { mongooseConn, pubsub }, info);

    expect(example.id).toBe(globalId);
    expect(example.textField1).toBe(data.textField1);
    expect(example.textField2).toBeUndefined();
    expect(example.textField3).toBe(data.textField3);
    expect(example.textField4).toBeUndefined();
    expect(example.textField5).toBeUndefined();
    expect(example.createdAt instanceof Date).toBeTruthy();
    expect(example.updatedAt).toBeUndefined();
    expect(example.__typename).toBe('Example'); // eslint-disable-line no-underscore-dangle

    const data2 = {
      textField1: 'textField1-2',
      textField2: 'textField2',
      textField3: 'textField3',
      textField4: ['textField4'],
      textField5: ['textField5'],
    };

    const createdExample2 = await createExample(
      null,
      { data: data2 },
      { mongooseConn, pubsub },
      null,
      {
        involvedFilters: { inputOutputEntity: [[]] },
      },
    );
    const { id: id2 } = createdExample2;

    const globalId2 = toGlobalId(id2, 'Example');
    const example2 = await node(null, { id: globalId2 }, { mongooseConn, pubsub }, info);

    expect(example2).toBe(null);
  });
});
