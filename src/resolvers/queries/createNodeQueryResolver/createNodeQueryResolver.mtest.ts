/* eslint-env jest */
import type {
  EntityFilters,
  FileAttributes,
  GeneralConfig,
  EntityConfig,
  ServersideConfig,
} from '../../../tsTypes';

import mongoose from 'mongoose';
import { PubSub } from 'graphql-subscriptions';

import mongoOptions from '../../../test/mongo-options';
import sleep from '../../../utils/sleep';
import createFileSchema from '../../../mongooseModels/createFileSchema';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import createCreateEntityMutationResolver from '../../mutations/createCreateEntityMutationResolver';
import toGlobalId from '../../utils/toGlobalId';

import createNodeQueryResolver from './index';

const info = { projection: { textField1: 1, textField3: 1, createdAt: 1 } };

mongoose.set('strictQuery', false);

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-node-query';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

afterAll(async () => {
  mongooseConn.connection.close();
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
      inputOutputEntity: [[]],
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
        inputOutputEntity: [[]],
      },
    );
    const { id: id2 } = createdExample2;

    const globalId2 = toGlobalId(id2, 'Example');
    const example2 = await node(null, { id: globalId2 }, { mongooseConn, pubsub }, info);

    expect(example2).toBe(null);
  });

  test('should use query entity file resolver', async () => {
    const serversideConfig = {
      composeFileFieldsData: {
        Image: ({ hash, _id }: FileAttributes) => {
          if (!_id) throw new TypeError('Have to define _id in composeFileFieldsData args!');
          const fullPath = `/images/`;
          return {
            fileId: _id,
            desktop: `${fullPath}${hash}_desktop`,
            tablet: `${fullPath}${hash}_tablet`,
            mobile: `${fullPath}${hash}_mobile`,
          };
        },
      },
    };

    const imageConfig: EntityConfig = {
      name: 'TangibleImage',
      type: 'tangibleFile',
      textFields: [
        { name: 'fileId', type: 'textFields' },
        { name: 'desktop', type: 'textFields' },
        { name: 'tablet', type: 'textFields' },
        { name: 'mobile', type: 'textFields' },
        { name: 'ukAlt', type: 'textFields' },
        { name: 'ruAlt', type: 'textFields' },
        { name: 'enAlt', type: 'textFields' },
      ],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { TangibleImage: imageConfig } };

    const fileSchema = createFileSchema(imageConfig);
    const FileModel = mongooseConn.model('Image_File', fileSchema);

    await FileModel.create({
      filename: 'photo.jpg',
      mimetype: 'image/jpeg',
      encoding: '7bit',
      hash: 'ebd602f658ade386de4e66a19c2c8cd7',
      uploadedAt: new Date('2020-07-02T04:17:49.022Z'),
    });

    const hash = '037bca6dff986131efdf996ed46c30ad';
    const { _id: id } = await FileModel.create({
      filename: 'photo2.jpg',
      mimetype: 'image/jpeg',
      encoding: '7bit',
      hash,
      uploadedAt: new Date('2020-07-02T04:17:49.022Z'),
    });

    await FileModel.create({
      filename: 'photo3.jpg',
      mimetype: 'image/jpeg',
      encoding: '7bit',
      hash: '04768b8a5237ef212bc911c15f445616',
      uploadedAt: new Date('2020-07-02T04:17:49.022Z'),
    });

    const node = createNodeQueryResolver(generalConfig, serversideConfig);
    if (!node) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const globalId = toGlobalId(id, 'TangibleImage');
    const imageFile = await node(null, { id: globalId }, { mongooseConn, pubsub }, info);

    expect(imageFile.id).toBe(globalId);
    expect(imageFile.hash).toBe(hash);
    expect(imageFile.desktop).toBe(`/images/${hash}_desktop`);
    expect(imageFile.tablet).toBe(`/images/${hash}_tablet`);
    expect(imageFile.mobile).toBe(`/images/${hash}_mobile`);
    expect(imageFile.__typename).toBe('TangibleImage'); // eslint-disable-line no-underscore-dangle
  });
});
