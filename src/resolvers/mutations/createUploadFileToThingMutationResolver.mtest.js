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
  default: createUploadFileToThingMutationResolver,
} = require('./createUploadFileToThingMutationResolver');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-upload-file-to-thing-mutation';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

describe('createUploadFileToThingMutationResolver', () => {
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
                fileId: '333',
                address: '/image/pic3',
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

    const uploadToThing = createUploadFileToThingMutationResolver(
      mainConfig,
      generalConfig,
      serversideConfig,
    );
    if (!uploadToThing) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const whereOne = { id };
    const options = { target: 'logo' };

    const updatedMain = await uploadToThing(null, { whereOne, options }, { mongooseConn, pubsub });

    expect(updatedMain.textField).toBe('text Field');
    expect(updatedMain.logo.fileId).toBe('777');
    expect(updatedMain.logo.address).toBe('/image/logo');
    expect(updatedMain.pictures).toEqual([]);

    const options2 = { target: 'pictures' };
    const updatedMain2 = await uploadToThing(
      null,
      { whereOne, options: options2 },
      { mongooseConn, pubsub },
    );
    expect(updatedMain2.pictures.length).toBe(1);

    const updatedMain3 = await uploadToThing(
      null,
      { whereOne, options: options2 },
      { mongooseConn, pubsub },
    );
    expect(updatedMain3.pictures.length).toBe(2);
  });
});
