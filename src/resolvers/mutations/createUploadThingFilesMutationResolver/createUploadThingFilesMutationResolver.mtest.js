// @flow
/* eslint-env jest */
/* eslint no-underscore-dangle: 0 */
import type { GeneralConfig, ThingConfig } from '../../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../../test/mongo-options');
const { default: createUploadThingFilesMutationResolver } = require('./index');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-upload-thing-files-mutation';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

describe('createUploadThingFilesMutationResolver', () => {
  const serversideConfig = {
    transactions: true,
    saveFiles: {
      Image: async ({ filename, mimetype, encoding }, hash, uploadedAt) => ({
        filename,
        mimetype,
        encoding,
        hash,
        uploadedAt,
      }),
      Photo: async ({ filename, mimetype, encoding }, hash, uploadedAt) => ({
        filename,
        mimetype,
        encoding,
        hash,
        uploadedAt,
      }),
    },

    composeFileFieldsData: {
      Image: ({ hash, filename, _id, uploadedAt }) => {
        const month = uploadedAt.getMonth() + 1;
        const month2 = month < 10 ? `0${month}` : month.toFixed();
        const year = uploadedAt.getFullYear();
        return {
          fileId: _id,
          desktop: `/images/${year}_${month2}/${hash}_desktop.${filename.slice(-3)}`,
          tablet: `/images/${year}_${month2}/${hash}_tablet.${filename.slice(-3)}`,
          mobile: `/images/${year}_${month2}/${hash}_mobile.${filename.slice(-3)}`,
        };
      },
      Photo: ({ hash, filename, _id, uploadedAt }) => {
        const month = uploadedAt.getMonth() + 1;
        const month2 = month < 10 ? `0${month}` : month.toFixed();
        const year = uploadedAt.getFullYear();
        return {
          fileId: _id,
          desktop: `/photos/${year}_${month2}/${hash}_desktop.${filename.slice(-3)}`,
          tablet: `/photos/${year}_${month2}/${hash}_tablet.${filename.slice(-3)}`,
          mobile: `/photos/${year}_${month2}/${hash}_mobile.${filename.slice(-3)}`,
        };
      },
    },
  };

  const imageConfig: ThingConfig = {
    name: 'Image',
    file: true,
    textFields: [
      {
        name: 'fileId',
        required: true,
      },
      {
        name: 'desktop',
        required: true,
      },
      {
        name: 'tablet',
        required: true,
      },
      {
        name: 'mobile',
        required: true,
      },
    ],
  };

  const generalConfig: GeneralConfig = {
    thingConfigs: { Image: imageConfig },
  };

  test('should create mutation to upload file fields', async () => {
    const uploadThingFiles = createUploadThingFilesMutationResolver(
      imageConfig,
      generalConfig,
      serversideConfig,
      true,
    );
    if (!uploadThingFiles) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    {
      const files = [
        {
          filename: 'pic1.png',
          mimetype: 'image/png',
          encoding: '7bit',
        },
        {
          filename: 'pic2.png',
          mimetype: 'image/png',
          encoding: '7bit',
        },
        {
          filename: 'photo1.jpg',
          mimetype: 'image/jpeg',
          encoding: '7bit',
        },
      ].map((item) => Promise.resolve(item));

      const hashes = ['pic1', 'pic2', 'photo1'];

      const uploadedFiles = await uploadThingFiles(
        null,
        { files, hashes },
        { mongooseConn, pubsub },
        null,
        [],
      );

      expect(uploadedFiles.length).toBe(hashes.length);
    }

    {
      const files = [
        {
          filename: 'pic1.png',
          mimetype: 'image/png',
          encoding: '7bit',
        },
        {
          filename: 'pic2.png',
          mimetype: 'image/png',
          encoding: '7bit',
        },
        {
          filename: 'photo1.jpg',
          mimetype: 'image/jpeg',
          encoding: '7bit',
        },
        {
          filename: 'photo2.jpg',
          mimetype: 'image/jpeg',
          encoding: '7bit',
        },
        {
          filename: 'photo3.jpg',
          mimetype: 'image/jpeg',
          encoding: '7bit',
        },
        {
          filename: 'pic3.png',
          mimetype: 'image/png',
          encoding: '7bit',
        },
        {
          filename: 'pic4.png',
          mimetype: 'image/png',
          encoding: '7bit',
        },
        {
          filename: 'pic5.png',
          mimetype: 'image/png',
          encoding: '7bit',
        },
        {
          filename: 'pic6.png',
          mimetype: 'image/png',
          encoding: '7bit',
        },
      ].map((item) => Promise.resolve(item));

      const hashes = [
        'pic1',
        'pic2',
        'photo1',
        'photo2',
        'photo3',
        'pic3',
        'pic4',
        'pic2',
        'photo1',
      ];

      const uploadedFiles = await uploadThingFiles(
        null,
        { files, hashes },
        { mongooseConn, pubsub },
        null,
        [],
      );

      expect(uploadedFiles.length).toBe(hashes.length);
    }
  });
});
