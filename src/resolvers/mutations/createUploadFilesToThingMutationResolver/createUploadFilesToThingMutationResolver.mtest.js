// @flow
/* eslint-env jest */
/* eslint no-underscore-dangle: 0 */
import type { GeneralConfig, ThingConfig } from '../../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../../test/mongo-options');
const {
  default: createCreateThingMutationResolver,
} = require('../createCreateThingMutationResolver');
const { default: createUploadFilesToThingMutationResolver } = require('./index');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-upload-files-to-thing-mutation';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

describe('createUploadFilesToThingMutationResolver', () => {
  const serversideConfig = {
    saveFiles: {
      Image: async ({ filename, mimetype, encoding }, hash) => ({
        filename,
        mimetype,
        encoding,
        hash,
      }),
      Photo: async ({ filename, mimetype, encoding }, hash) => ({
        filename,
        mimetype,
        encoding,
        hash,
      }),
    },

    composeFileFieldsData: {
      Image: ({ hash, filename, _id }, date) => {
        const month = date.getMonth() + 1;
        const month2 = month < 10 ? `0${month}` : month.toFixed();
        const year = date.getFullYear();
        return {
          fileId: _id,
          desktop: `/images/${year}_${month2}/${hash}_desktop.${filename.slice(-3)}`,
          tablet: `/images/${year}_${month2}/${hash}_tablet.${filename.slice(-3)}`,
          mobile: `/images/${year}_${month2}/${hash}_mobile.${filename.slice(-3)}`,
        };
      },
      Photo: ({ hash, filename, _id }, date) => {
        const month = date.getMonth() + 1;
        const month2 = month < 10 ? `0${month}` : month.toFixed();
        const year = date.getFullYear();
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
    embedded: true,
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
  const photoConfig: ThingConfig = {
    name: 'Photo',
    embedded: true,
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
  const exampleConfig: ThingConfig = {};
  Object.assign(exampleConfig, {
    name: 'Example',

    fileFields: [
      {
        name: 'logo',
        config: imageConfig,
      },
      {
        name: 'header',
        config: imageConfig,
      },
      {
        name: 'pictures',
        config: imageConfig,
        array: true,
      },
      {
        name: 'photos',
        config: photoConfig,
        array: true,
      },
    ],

    textFields: [
      {
        name: 'textField',
      },
    ],
  });

  const generalConfig: GeneralConfig = { thingConfigs: [imageConfig, photoConfig, exampleConfig] };

  test('should create mutation update thing resolver to update file field', async () => {
    const createExample = createCreateThingMutationResolver(
      exampleConfig,
      generalConfig,
      serversideConfig,
    );

    expect(typeof createExample).toBe('function');
    if (!createExample) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      textField: 'text Field',
      logo: null,
      header: null,
    };

    const createdExample = await createExample(null, { data }, { mongooseConn, pubsub });
    expect(createdExample.textField).toBe(data.textField);
    const { id } = createdExample;

    const uploadToThing = createUploadFilesToThingMutationResolver(
      exampleConfig,
      generalConfig,
      serversideConfig,
    );
    if (!uploadToThing) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

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
    ].map(item => Promise.resolve(item));

    const whereOne = { id };
    const options = {
      targets: ['logo', 'header', 'photos', 'pictures'],
      counts: [1, 1, 3, 2],
      hashes: ['pic1', 'pic2', 'photo1', 'photo2', 'photo3', 'pic3', 'pic4'],
    };

    const updatedExample = await uploadToThing(
      null,
      { files, whereOne, options },
      { mongooseConn, pubsub },
    );
    expect(updatedExample.textField).toBe('text Field');

    expect(updatedExample.logo.desktop).toBe('/images/2020_03/pic1_desktop.png');
    expect(updatedExample.logo.tablet).toBe('/images/2020_03/pic1_tablet.png');
    expect(updatedExample.logo.mobile).toBe('/images/2020_03/pic1_mobile.png');

    expect(updatedExample.header.desktop).toBe('/images/2020_03/pic2_desktop.png');
    expect(updatedExample.header.tablet).toBe('/images/2020_03/pic2_tablet.png');
    expect(updatedExample.header.mobile).toBe('/images/2020_03/pic2_mobile.png');

    expect(updatedExample.pictures.length).toBe(2);

    expect(updatedExample.pictures[0].desktop).toBe('/images/2020_03/pic3_desktop.png');
    expect(updatedExample.pictures[0].tablet).toBe('/images/2020_03/pic3_tablet.png');
    expect(updatedExample.pictures[0].mobile).toBe('/images/2020_03/pic3_mobile.png');

    expect(updatedExample.pictures[1].desktop).toBe('/images/2020_03/pic4_desktop.png');
    expect(updatedExample.pictures[1].tablet).toBe('/images/2020_03/pic4_tablet.png');
    expect(updatedExample.pictures[1].mobile).toBe('/images/2020_03/pic4_mobile.png');

    expect(updatedExample.photos.length).toBe(3);

    expect(updatedExample.photos[0].desktop).toBe('/photos/2020_03/photo1_desktop.jpg');
    expect(updatedExample.photos[0].tablet).toBe('/photos/2020_03/photo1_tablet.jpg');
    expect(updatedExample.photos[0].mobile).toBe('/photos/2020_03/photo1_mobile.jpg');

    expect(updatedExample.photos[1].desktop).toBe('/photos/2020_03/photo2_desktop.jpg');
    expect(updatedExample.photos[1].tablet).toBe('/photos/2020_03/photo2_tablet.jpg');
    expect(updatedExample.photos[1].mobile).toBe('/photos/2020_03/photo2_mobile.jpg');

    expect(updatedExample.photos[2].desktop).toBe('/photos/2020_03/photo3_desktop.jpg');
    expect(updatedExample.photos[2].tablet).toBe('/photos/2020_03/photo3_tablet.jpg');
    expect(updatedExample.photos[2].mobile).toBe('/photos/2020_03/photo3_mobile.jpg');

    const updatedExample2 = await uploadToThing(
      null,
      { files, whereOne, options },
      { mongooseConn, pubsub },
    );

    expect(updatedExample2.textField).toBe('text Field');

    expect(updatedExample2.logo.desktop).toBe('/images/2020_03/pic1_desktop.png');
    expect(updatedExample2.logo.tablet).toBe('/images/2020_03/pic1_tablet.png');
    expect(updatedExample2.logo.mobile).toBe('/images/2020_03/pic1_mobile.png');

    expect(updatedExample2.header.desktop).toBe('/images/2020_03/pic2_desktop.png');
    expect(updatedExample2.header.tablet).toBe('/images/2020_03/pic2_tablet.png');
    expect(updatedExample2.header.mobile).toBe('/images/2020_03/pic2_mobile.png');

    expect(updatedExample2.pictures.length).toBe(4);

    expect(updatedExample2.pictures[0].desktop).toBe('/images/2020_03/pic3_desktop.png');
    expect(updatedExample2.pictures[0].tablet).toBe('/images/2020_03/pic3_tablet.png');
    expect(updatedExample2.pictures[0].mobile).toBe('/images/2020_03/pic3_mobile.png');

    expect(updatedExample2.pictures[1].desktop).toBe('/images/2020_03/pic4_desktop.png');
    expect(updatedExample2.pictures[1].tablet).toBe('/images/2020_03/pic4_tablet.png');
    expect(updatedExample2.pictures[1].mobile).toBe('/images/2020_03/pic4_mobile.png');

    expect(updatedExample2.pictures[2].desktop).toBe('/images/2020_03/pic3_desktop.png');
    expect(updatedExample2.pictures[2].tablet).toBe('/images/2020_03/pic3_tablet.png');
    expect(updatedExample2.pictures[2].mobile).toBe('/images/2020_03/pic3_mobile.png');

    expect(updatedExample2.pictures[3].desktop).toBe('/images/2020_03/pic4_desktop.png');
    expect(updatedExample2.pictures[3].tablet).toBe('/images/2020_03/pic4_tablet.png');
    expect(updatedExample2.pictures[3].mobile).toBe('/images/2020_03/pic4_mobile.png');

    expect(updatedExample2.photos.length).toBe(6);

    expect(updatedExample2.photos[0].desktop).toBe('/photos/2020_03/photo1_desktop.jpg');
    expect(updatedExample2.photos[0].tablet).toBe('/photos/2020_03/photo1_tablet.jpg');
    expect(updatedExample2.photos[0].mobile).toBe('/photos/2020_03/photo1_mobile.jpg');

    expect(updatedExample2.photos[1].desktop).toBe('/photos/2020_03/photo2_desktop.jpg');
    expect(updatedExample2.photos[1].tablet).toBe('/photos/2020_03/photo2_tablet.jpg');
    expect(updatedExample2.photos[1].mobile).toBe('/photos/2020_03/photo2_mobile.jpg');

    expect(updatedExample2.photos[2].desktop).toBe('/photos/2020_03/photo3_desktop.jpg');
    expect(updatedExample2.photos[2].tablet).toBe('/photos/2020_03/photo3_tablet.jpg');
    expect(updatedExample2.photos[2].mobile).toBe('/photos/2020_03/photo3_mobile.jpg');

    expect(updatedExample2.photos[3].desktop).toBe('/photos/2020_03/photo1_desktop.jpg');
    expect(updatedExample2.photos[3].tablet).toBe('/photos/2020_03/photo1_tablet.jpg');
    expect(updatedExample2.photos[3].mobile).toBe('/photos/2020_03/photo1_mobile.jpg');

    expect(updatedExample2.photos[4].desktop).toBe('/photos/2020_03/photo2_desktop.jpg');
    expect(updatedExample2.photos[4].tablet).toBe('/photos/2020_03/photo2_tablet.jpg');
    expect(updatedExample2.photos[4].mobile).toBe('/photos/2020_03/photo2_mobile.jpg');

    expect(updatedExample2.photos[5].desktop).toBe('/photos/2020_03/photo3_desktop.jpg');
    expect(updatedExample2.photos[5].tablet).toBe('/photos/2020_03/photo3_tablet.jpg');
    expect(updatedExample2.photos[5].mobile).toBe('/photos/2020_03/photo3_mobile.jpg');
  });
});
