/* eslint-env jest */

import type { FileAttributes, GeneralConfig, EntityConfig } from '../../../tsTypes';

import mongoose from 'mongoose';
import { PubSub } from 'graphql-subscriptions';

import mongoOptions from '../../../test/mongo-options';
import createFileSchema from '../../../mongooseModels/createFileSchema';
import createEntityFilesQueryResolver from './index';

mongoose.set('strictQuery', false);

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entity-files-query';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('createEntityFilesQueryResolver', () => {
  const generalConfig: GeneralConfig = { allEntityConfigs: {} };
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
      name: 'TangibleImage',
      type: 'tangibleFile',
      textFields: [
        { name: 'hash', type: 'textFields' },
        { name: 'fileId', type: 'textFields' },
        { name: 'desktop', type: 'textFields' },
        { name: 'tablet', type: 'textFields' },
        { name: 'mobile', type: 'textFields' },
        { name: 'ukAlt', type: 'textFields' },
        { name: 'ruAlt', type: 'textFields' },
        { name: 'enAlt', type: 'textFields' },
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

    const ImageFile = createEntityFilesQueryResolver(imageConfig, generalConfig, serversideConfig);

    if (!ImageFile) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error
    const imageFiles = await ImageFile(null, { where: {} }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[]],
    });

    expect(imageFiles.length).toBe(files.length);
    for (let i = 0; i < files.length; i += 1) {
      expect(imageFiles[i].hash).toBe(files[i].hash);
      expect(imageFiles[i].desktop).toBe(`/images/${files[i].hash}_desktop`);
      expect(imageFiles[i].tablet).toBe(`/images/${files[i].hash}_tablet`);
      expect(imageFiles[i].mobile).toBe(`/images/${files[i].hash}_mobile`);
    }

    const where = { hash_in: [files[0].hash, files[2].hash] };
    const imageFiles2 = await ImageFile(null, { where }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[]],
    });

    expect(imageFiles2.length).toBe(2);

    const imageFilesLimited = await ImageFile(null, { where: {} }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[], 2],
    });

    expect(imageFilesLimited.length).toBe(2);
  });
});
