// @flow
/* eslint-env jest */

import type { FileAttributes, GeneralConfig, EntityConfig } from '../../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../../test/mongo-options');
const { default: createFileSchema } = require('../../../mongooseModels/createFileSchema');
const { default: createEntityFileCountQueryResolver } = require('./index');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-create-entity-file-query';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('createEntityQueryResolver', () => {
  const generalConfig: GeneralConfig = { entityConfigs: {} };
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
  test('should create query entity resolver', async () => {
    const imageConfig: EntityConfig = {
      name: 'RootImage',
      type: 'tangibleFile',
      textFields: [
        { name: 'fileId' },
        { name: 'desktop' },
        { name: 'tablet' },
        { name: 'mobile' },
        { name: 'ukAlt' },
        { name: 'ruAlt' },
        { name: 'enAlt' },
      ],
    };
    const fileSchema = createFileSchema(imageConfig);
    const FileModel = mongooseConn.model('Image_File', fileSchema);

    const files = [
      {
        filename: 'photo.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
        hash: 'ebd602f658ade386de4e66a19c2c8cd7',
        uploadedAt: new Date('2020-07-02T04:17:49.022Z'),
      },
      {
        filename: 'photo2.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
        hash: '037bca6dff986131efdf996ed46c30ad',
        uploadedAt: new Date('2020-07-02T04:17:49.022Z'),
      },
      {
        filename: 'photo3.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
        hash: '04768b8a5237ef212bc911c15f445616',
        uploadedAt: new Date('2020-07-02T04:17:49.022Z'),
      },
    ];

    await FileModel.create(files[0]);

    await FileModel.create(files[1]);

    await FileModel.create(files[2]);

    const ImageFileCount = createEntityFileCountQueryResolver(
      imageConfig,
      generalConfig,
      serversideConfig,
    );

    if (!ImageFileCount) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error
    const imageFileCount = await ImageFileCount(null, { where: {} }, { mongooseConn, pubsub });

    expect(imageFileCount).toBe(files.length);

    const where = { hash_in: [files[0].hash, files[2].hash] };
    const imageFilesCount2 = await ImageFileCount(null, { where }, { mongooseConn, pubsub });

    expect(imageFilesCount2).toBe(2);
  });
});