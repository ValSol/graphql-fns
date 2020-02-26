// @flow
/* eslint-env jest */
/* eslint no-underscore-dangle: 0 */
import type { GeneralConfig, ThingConfig } from '../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../test/mongo-options');
const {
  default: createCreateThingMutationResolver,
} = require('./createCreateThingMutationResolver');
const {
  default: createUploadManyFilesToThingMutationResolver,
} = require('./createUploadManyFilesToThingMutationResolver');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-upload-many-files-to-thing-mutation';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

describe('createUploadManyFilesToThingMutationResolver', () => {
  const generalConfig: GeneralConfig = { thingConfigs: [] };
  const serversideConfig = {
    saveFiles: async ({
      resolverArgs: {
        args: {
          options: { target },
        },
      },
    }) =>
      target === 'logo'
        ? {
            logo: {
              fileId: '777',
              address: '/image/logo',
            },
          }
        : {
            pictures: [
              {
                fileId: '111',
                address: '/image/pic1',
              },
              {
                fileId: '222',
                address: '/image/pic2',
              },
            ],
          },
  };

  test('should create mutation update thing resolver to update file field', async () => {
    const imageConfig: ThingConfig = {
      name: 'Image',
      embedded: true,
      textFields: [
        {
          name: 'fileId',
        },
        {
          name: 'address',
        },
      ],
    };

    const mainConfig: ThingConfig = {
      name: 'Main2',
      textFields: [
        {
          name: 'textField',
        },
      ],
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
        },
        {
          name: 'pictures',
          config: imageConfig,
          array: true,
        },
      ],
    };

    const createMain = createCreateThingMutationResolver(
      mainConfig,
      generalConfig,
      serversideConfig,
    );

    expect(typeof createMain).toBe('function');
    if (!createMain) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      textField: 'text Field',
    };

    const createdMain = await createMain(null, { data }, { mongooseConn, pubsub });
    expect(createdMain.textField).toBe(data.textField);
    const { id } = createdMain;

    const uploadToThing = createUploadManyFilesToThingMutationResolver(
      mainConfig,
      generalConfig,
      serversideConfig,
    );
    if (!uploadToThing) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const whereOne = { id };
    const options = { target: 'pictures' };

    const updatedMain = await uploadToThing(null, { whereOne, options }, { mongooseConn, pubsub });

    expect(updatedMain.textField).toBe('text Field');
    expect(updatedMain.pictures.length).toEqual(2);

    const options2 = { target: 'pictures' };
    const updatedMain2 = await uploadToThing(
      null,
      { whereOne, options: options2 },
      { mongooseConn, pubsub },
    );
    expect(updatedMain2.pictures.length).toBe(4);

    const updatedMain3 = await uploadToThing(
      null,
      { whereOne, options: options2 },
      { mongooseConn, pubsub },
    );
    expect(updatedMain3.pictures.length).toBe(6);
  });
});
