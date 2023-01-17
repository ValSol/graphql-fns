// @flow
/* eslint-env jest */

import type { FileAttributes, GeneralConfig, EntityConfig } from '../../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../../test/mongo-options');
const { default: createFileSchema } = require('../../../mongooseModels/createFileSchema');
const { default: createEntityFileQueryResolver } = require('./index');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entity-file-query';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('createEntityFileQueryResolver', () => {
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
        { name: 'hash' },
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

    const ImageFile = createEntityFileQueryResolver(imageConfig, generalConfig, serversideConfig);

    const whereOne = { hash };
    if (!ImageFile) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const imageFile = await ImageFile(null, { whereOne }, { mongooseConn, pubsub }, null, {
      inputEntity: [],
    });

    expect(imageFile.id.toString()).toBe(id.toString());
    expect(imageFile.hash).toBe(hash);
    expect(imageFile.desktop).toBe(`/images/${hash}_desktop`);
    expect(imageFile.tablet).toBe(`/images/${hash}_tablet`);
    expect(imageFile.mobile).toBe(`/images/${hash}_mobile`);

    const imageFile2 = await ImageFile(null, { whereOne: { id } }, { mongooseConn, pubsub }, null, {
      inputEntity: [],
    });

    expect(imageFile2.id.toString()).toBe(id.toString());
    expect(imageFile2.hash).toBe(hash);
    expect(imageFile2.desktop).toBe(`/images/${hash}_desktop`);
    expect(imageFile2.tablet).toBe(`/images/${hash}_tablet`);
    expect(imageFile2.mobile).toBe(`/images/${hash}_mobile`);
  });
});
