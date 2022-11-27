// @flow
/* eslint-env jest */
/* eslint no-underscore-dangle: 0 */
import type { GeneralConfig, EntityConfig } from '../../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../../test/mongo-options');
const { default: createThingSchema } = require('../../../mongooseModels/createThingSchema');
const {
  default: createCreateEntityMutationResolver,
} = require('../createCreateEntityMutationResolver');
const { default: createUploadFilesToEntityMutationResolver } = require('./index');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-upload-files-to-entity-mutation';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('createUploadFilesToEntityMutationResolver', () => {
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

  const imageConfig: EntityConfig = {
    name: 'Image',
    type: 'file',
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
  const photoConfig: EntityConfig = {
    name: 'Photo',
    type: 'file',
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
  const exampleConfig: EntityConfig = {};
  Object.assign(exampleConfig, {
    name: 'Example',
    type: 'tangible',

    fileFields: [
      {
        name: 'logo',
        config: imageConfig,
        index: true,
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
        index: true,
      },
    ],

    textFields: [
      {
        name: 'textField',
      },
    ],
  });

  const generalConfig: GeneralConfig = {
    entityConfigs: { Image: imageConfig, Photo: photoConfig, Example: exampleConfig },
  };

  test('should create mutation update entity resolver to update file field', async () => {
    const parentSchema = createThingSchema(exampleConfig);
    const Parent = mongooseConn.model('Parent_Thing', parentSchema);
    await Parent.createCollection();

    const createExample = createCreateEntityMutationResolver(
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

    const uploadToEntity = createUploadFilesToEntityMutationResolver(
      exampleConfig,
      generalConfig,
      serversideConfig,
      true,
    );
    if (!uploadToEntity) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

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
    ].map((item) => Promise.resolve(item));

    const whereOne = { id };
    const options = {
      targets: ['logo', 'header', 'photos', 'pictures'],
      counts: [1, 1, 3, 2],
      hashes: ['pic1', 'pic2', 'photo1', 'photo2', 'photo3', 'pic3', 'pic4'],
    };

    const projection = {};

    const updatedExample = await uploadToEntity(
      null,
      { files, whereOne, options },
      { mongooseConn, pubsub },
      { projection },
      [],
    );

    const uploadedAt = new Date();
    const month = uploadedAt.getMonth() + 1;
    const month2 = month < 10 ? `0${month}` : month.toFixed();
    const year = uploadedAt.getFullYear();
    const datePath = `${year}_${month2}`;

    expect(updatedExample.textField).toBe('text Field');

    expect(updatedExample.logo.desktop).toBe(`/images/${datePath}/pic1_desktop.png`);
    expect(updatedExample.logo.tablet).toBe(`/images/${datePath}/pic1_tablet.png`);
    expect(updatedExample.logo.mobile).toBe(`/images/${datePath}/pic1_mobile.png`);

    expect(updatedExample.header.desktop).toBe(`/images/${datePath}/pic2_desktop.png`);
    expect(updatedExample.header.tablet).toBe(`/images/${datePath}/pic2_tablet.png`);
    expect(updatedExample.header.mobile).toBe(`/images/${datePath}/pic2_mobile.png`);

    expect(updatedExample.pictures.length).toBe(2);

    expect(updatedExample.pictures[0].desktop).toBe(`/images/${datePath}/pic3_desktop.png`);
    expect(updatedExample.pictures[0].tablet).toBe(`/images/${datePath}/pic3_tablet.png`);
    expect(updatedExample.pictures[0].mobile).toBe(`/images/${datePath}/pic3_mobile.png`);

    expect(updatedExample.pictures[1].desktop).toBe(`/images/${datePath}/pic4_desktop.png`);
    expect(updatedExample.pictures[1].tablet).toBe(`/images/${datePath}/pic4_tablet.png`);
    expect(updatedExample.pictures[1].mobile).toBe(`/images/${datePath}/pic4_mobile.png`);

    expect(updatedExample.photos.length).toBe(3);

    expect(updatedExample.photos[0].desktop).toBe(`/photos/${datePath}/photo1_desktop.jpg`);
    expect(updatedExample.photos[0].tablet).toBe(`/photos/${datePath}/photo1_tablet.jpg`);
    expect(updatedExample.photos[0].mobile).toBe(`/photos/${datePath}/photo1_mobile.jpg`);

    expect(updatedExample.photos[1].desktop).toBe(`/photos/${datePath}/photo2_desktop.jpg`);
    expect(updatedExample.photos[1].tablet).toBe(`/photos/${datePath}/photo2_tablet.jpg`);
    expect(updatedExample.photos[1].mobile).toBe(`/photos/${datePath}/photo2_mobile.jpg`);

    expect(updatedExample.photos[2].desktop).toBe(`/photos/${datePath}/photo3_desktop.jpg`);
    expect(updatedExample.photos[2].tablet).toBe(`/photos/${datePath}/photo3_tablet.jpg`);
    expect(updatedExample.photos[2].mobile).toBe(`/photos/${datePath}/photo3_mobile.jpg`);

    const updatedExample2 = await uploadToEntity(
      null,
      { files, whereOne, options },
      { mongooseConn, pubsub },
      { projection },
      [],
    );

    expect(updatedExample2.textField).toBe('text Field');

    expect(updatedExample2.logo.desktop).toBe(`/images/${datePath}/pic1_desktop.png`);
    expect(updatedExample2.logo.tablet).toBe(`/images/${datePath}/pic1_tablet.png`);
    expect(updatedExample2.logo.mobile).toBe(`/images/${datePath}/pic1_mobile.png`);

    expect(updatedExample2.header.desktop).toBe(`/images/${datePath}/pic2_desktop.png`);
    expect(updatedExample2.header.tablet).toBe(`/images/${datePath}/pic2_tablet.png`);
    expect(updatedExample2.header.mobile).toBe(`/images/${datePath}/pic2_mobile.png`);

    expect(updatedExample2.pictures.length).toBe(4);

    expect(updatedExample2.pictures[0].desktop).toBe(`/images/${datePath}/pic3_desktop.png`);
    expect(updatedExample2.pictures[0].tablet).toBe(`/images/${datePath}/pic3_tablet.png`);
    expect(updatedExample2.pictures[0].mobile).toBe(`/images/${datePath}/pic3_mobile.png`);

    expect(updatedExample2.pictures[1].desktop).toBe(`/images/${datePath}/pic4_desktop.png`);
    expect(updatedExample2.pictures[1].tablet).toBe(`/images/${datePath}/pic4_tablet.png`);
    expect(updatedExample2.pictures[1].mobile).toBe(`/images/${datePath}/pic4_mobile.png`);

    expect(updatedExample2.pictures[2].desktop).toBe(`/images/${datePath}/pic3_desktop.png`);
    expect(updatedExample2.pictures[2].tablet).toBe(`/images/${datePath}/pic3_tablet.png`);
    expect(updatedExample2.pictures[2].mobile).toBe(`/images/${datePath}/pic3_mobile.png`);

    expect(updatedExample2.pictures[3].desktop).toBe(`/images/${datePath}/pic4_desktop.png`);
    expect(updatedExample2.pictures[3].tablet).toBe(`/images/${datePath}/pic4_tablet.png`);
    expect(updatedExample2.pictures[3].mobile).toBe(`/images/${datePath}/pic4_mobile.png`);

    expect(updatedExample2.photos.length).toBe(6);

    expect(updatedExample2.photos[0].desktop).toBe(`/photos/${datePath}/photo1_desktop.jpg`);
    expect(updatedExample2.photos[0].tablet).toBe(`/photos/${datePath}/photo1_tablet.jpg`);
    expect(updatedExample2.photos[0].mobile).toBe(`/photos/${datePath}/photo1_mobile.jpg`);

    expect(updatedExample2.photos[1].desktop).toBe(`/photos/${datePath}/photo2_desktop.jpg`);
    expect(updatedExample2.photos[1].tablet).toBe(`/photos/${datePath}/photo2_tablet.jpg`);
    expect(updatedExample2.photos[1].mobile).toBe(`/photos/${datePath}/photo2_mobile.jpg`);

    expect(updatedExample2.photos[2].desktop).toBe(`/photos/${datePath}/photo3_desktop.jpg`);
    expect(updatedExample2.photos[2].tablet).toBe(`/photos/${datePath}/photo3_tablet.jpg`);
    expect(updatedExample2.photos[2].mobile).toBe(`/photos/${datePath}/photo3_mobile.jpg`);

    expect(updatedExample2.photos[3].desktop).toBe(`/photos/${datePath}/photo1_desktop.jpg`);
    expect(updatedExample2.photos[3].tablet).toBe(`/photos/${datePath}/photo1_tablet.jpg`);
    expect(updatedExample2.photos[3].mobile).toBe(`/photos/${datePath}/photo1_mobile.jpg`);

    expect(updatedExample2.photos[4].desktop).toBe(`/photos/${datePath}/photo2_desktop.jpg`);
    expect(updatedExample2.photos[4].tablet).toBe(`/photos/${datePath}/photo2_tablet.jpg`);
    expect(updatedExample2.photos[4].mobile).toBe(`/photos/${datePath}/photo2_mobile.jpg`);

    expect(updatedExample2.photos[5].desktop).toBe(`/photos/${datePath}/photo3_desktop.jpg`);
    expect(updatedExample2.photos[5].tablet).toBe(`/photos/${datePath}/photo3_tablet.jpg`);
    expect(updatedExample2.photos[5].mobile).toBe(`/photos/${datePath}/photo3_mobile.jpg`);

    const files2 = [
      {
        filename: 'pic1.png',
        mimetype: 'image/png',
        encoding: '7bit',
      },
      {
        filename: 'pic1.png',
        mimetype: 'image/png',
        encoding: '7bit',
      },
      {
        filename: 'photo10.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
      },
      {
        filename: 'pic7.png',
        mimetype: 'image/png',
        encoding: '7bit',
      },
      {
        filename: 'pic8.png',
        mimetype: 'image/png',
        encoding: '7bit',
      },
      {
        filename: 'pic3.png',
        mimetype: 'image/png',
        encoding: '7bit',
      },
      {
        filename: 'pic1.png',
        mimetype: 'image/png',
        encoding: '7bit',
      },
    ].map((item) => Promise.resolve(item));

    const options2 = {
      targets: ['logo', 'header', 'photos', 'pictures'],
      counts: [1, 1, 3, 2],
      hashes: ['pic1', 'pic1', 'photo10', 'pic7', 'pic8', 'pic3', 'pic1'],
    };

    const positions = { photos: [0, 3, 5] };

    const filter = [{ logo_exists: true, photos_size: 3 }];

    const updatedExample3 = await uploadToEntity(
      null,
      { files: files2, whereOne, options: options2, positions },
      { mongooseConn, pubsub },
      { projection },
      filter,
    );

    expect(updatedExample3.textField).toBe('text Field');

    expect(updatedExample3.logo.desktop).toBe(`/images/${datePath}/pic1_desktop.png`);
    expect(updatedExample3.logo.tablet).toBe(`/images/${datePath}/pic1_tablet.png`);
    expect(updatedExample3.logo.mobile).toBe(`/images/${datePath}/pic1_mobile.png`);

    expect(updatedExample3.header.desktop).toBe(`/images/${datePath}/pic1_desktop.png`);
    expect(updatedExample3.header.tablet).toBe(`/images/${datePath}/pic1_tablet.png`);
    expect(updatedExample3.header.mobile).toBe(`/images/${datePath}/pic1_mobile.png`);

    expect(updatedExample3.pictures.length).toBe(6);

    expect(updatedExample3.pictures[0].desktop).toBe(`/images/${datePath}/pic3_desktop.png`);
    expect(updatedExample3.pictures[0].tablet).toBe(`/images/${datePath}/pic3_tablet.png`);
    expect(updatedExample3.pictures[0].mobile).toBe(`/images/${datePath}/pic3_mobile.png`);

    expect(updatedExample3.pictures[1].desktop).toBe(`/images/${datePath}/pic4_desktop.png`);
    expect(updatedExample3.pictures[1].tablet).toBe(`/images/${datePath}/pic4_tablet.png`);
    expect(updatedExample3.pictures[1].mobile).toBe(`/images/${datePath}/pic4_mobile.png`);

    expect(updatedExample3.pictures[2].desktop).toBe(`/images/${datePath}/pic3_desktop.png`);
    expect(updatedExample3.pictures[2].tablet).toBe(`/images/${datePath}/pic3_tablet.png`);
    expect(updatedExample3.pictures[2].mobile).toBe(`/images/${datePath}/pic3_mobile.png`);

    expect(updatedExample3.pictures[3].desktop).toBe(`/images/${datePath}/pic4_desktop.png`);
    expect(updatedExample3.pictures[3].tablet).toBe(`/images/${datePath}/pic4_tablet.png`);
    expect(updatedExample3.pictures[3].mobile).toBe(`/images/${datePath}/pic4_mobile.png`);

    expect(updatedExample3.pictures[4].desktop).toBe(`/images/${datePath}/pic3_desktop.png`);
    expect(updatedExample3.pictures[4].tablet).toBe(`/images/${datePath}/pic3_tablet.png`);
    expect(updatedExample3.pictures[4].mobile).toBe(`/images/${datePath}/pic3_mobile.png`);

    expect(updatedExample3.pictures[5].desktop).toBe(`/images/${datePath}/pic1_desktop.png`);
    expect(updatedExample3.pictures[5].tablet).toBe(`/images/${datePath}/pic1_tablet.png`);
    expect(updatedExample3.pictures[5].mobile).toBe(`/images/${datePath}/pic1_mobile.png`);

    expect(updatedExample3.photos.length).toBe(9);

    expect(updatedExample3.photos[0].desktop).toBe(`/photos/${datePath}/photo10_desktop.jpg`);
    expect(updatedExample3.photos[0].tablet).toBe(`/photos/${datePath}/photo10_tablet.jpg`);
    expect(updatedExample3.photos[0].mobile).toBe(`/photos/${datePath}/photo10_mobile.jpg`);

    expect(updatedExample3.photos[1].desktop).toBe(`/photos/${datePath}/photo1_desktop.jpg`);
    expect(updatedExample3.photos[1].tablet).toBe(`/photos/${datePath}/photo1_tablet.jpg`);
    expect(updatedExample3.photos[1].mobile).toBe(`/photos/${datePath}/photo1_mobile.jpg`);

    expect(updatedExample3.photos[2].desktop).toBe(`/photos/${datePath}/photo2_desktop.jpg`);
    expect(updatedExample3.photos[2].tablet).toBe(`/photos/${datePath}/photo2_tablet.jpg`);
    expect(updatedExample3.photos[2].mobile).toBe(`/photos/${datePath}/photo2_mobile.jpg`);

    expect(updatedExample3.photos[3].desktop).toBe(`/photos/${datePath}/pic7_desktop.png`);
    expect(updatedExample3.photos[3].tablet).toBe(`/photos/${datePath}/pic7_tablet.png`);
    expect(updatedExample3.photos[3].mobile).toBe(`/photos/${datePath}/pic7_mobile.png`);

    expect(updatedExample3.photos[4].desktop).toBe(`/photos/${datePath}/photo3_desktop.jpg`);
    expect(updatedExample3.photos[4].tablet).toBe(`/photos/${datePath}/photo3_tablet.jpg`);
    expect(updatedExample3.photos[4].mobile).toBe(`/photos/${datePath}/photo3_mobile.jpg`);

    expect(updatedExample3.photos[5].desktop).toBe(`/photos/${datePath}/pic8_desktop.png`);
    expect(updatedExample3.photos[5].tablet).toBe(`/photos/${datePath}/pic8_tablet.png`);
    expect(updatedExample3.photos[5].mobile).toBe(`/photos/${datePath}/pic8_mobile.png`);

    expect(updatedExample3.photos[6].desktop).toBe(`/photos/${datePath}/photo1_desktop.jpg`);
    expect(updatedExample3.photos[6].tablet).toBe(`/photos/${datePath}/photo1_tablet.jpg`);
    expect(updatedExample3.photos[6].mobile).toBe(`/photos/${datePath}/photo1_mobile.jpg`);

    expect(updatedExample3.photos[7].desktop).toBe(`/photos/${datePath}/photo2_desktop.jpg`);
    expect(updatedExample3.photos[7].tablet).toBe(`/photos/${datePath}/photo2_tablet.jpg`);
    expect(updatedExample3.photos[7].mobile).toBe(`/photos/${datePath}/photo2_mobile.jpg`);

    expect(updatedExample3.photos[8].desktop).toBe(`/photos/${datePath}/photo3_desktop.jpg`);
    expect(updatedExample3.photos[8].tablet).toBe(`/photos/${datePath}/photo3_tablet.jpg`);
    expect(updatedExample3.photos[8].mobile).toBe(`/photos/${datePath}/photo3_mobile.jpg`);

    const filter2 = [{ logo_exists: true, photos_size: 2 }];

    const updatedExample4 = await uploadToEntity(
      null,
      { files: files2, whereOne, options: options2, positions },
      { mongooseConn, pubsub },
      { projection },
      filter2,
    );

    expect(updatedExample4).toBe(null);
  });
});
