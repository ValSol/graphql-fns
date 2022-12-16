// @flow
/* eslint-env jest */

import type { FileAttributes, GeneralConfig, EntityConfig } from '../../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../../test/mongo-options');
const { default: createFileSchema } = require('../../../mongooseModels/createFileSchema');
const { default: toCursor } = require('../../utils/toCursor');
const { default: createEntityFilesQueryResolver } = require('../createEntityFilesQueryResolver');

const { default: createEntityFilesThroughConnectionQueryResolver } = require('./index');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entity-files-through-connection-query';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('createEntityFilesThroughConnectionQueryResolver', () => {
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
        filename: 'photo0.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
        hash: '0',
        uploadedAt: new Date('2022-12-12T04:17:49.022Z'),
      },
      {
        filename: 'photo1.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
        hash: '1',
        uploadedAt: new Date('2022-12-12T04:17:49.022Z'),
      },
      {
        filename: 'photo2.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
        hash: '2',
        uploadedAt: new Date('2022-12-12T04:17:49.022Z'),
      },
      {
        filename: 'photo3.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
        hash: '3',
        uploadedAt: new Date('2022-12-12T04:17:49.022Z'),
      },
      {
        filename: 'photo4.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
        hash: '4',
        uploadedAt: new Date('2022-12-12T04:17:49.022Z'),
      },
      {
        filename: 'photo5.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
        hash: '5',
        uploadedAt: new Date('2022-12-12T04:17:49.022Z'),
      },
      {
        filename: 'photo6.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
        hash: '6',
        uploadedAt: new Date('2022-12-12T04:17:49.022Z'),
      },
      {
        filename: 'photo7.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
        hash: '7',
        uploadedAt: new Date('2022-12-12T04:17:49.022Z'),
      },
      {
        filename: 'photo8.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
        hash: '8',
        uploadedAt: new Date('2022-12-12T04:17:49.022Z'),
      },
      {
        filename: 'photo9.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
        hash: '9',
        uploadedAt: new Date('2022-12-12T04:17:49.022Z'),
      },
      {
        filename: 'photo10.jpg',
        mimetype: 'image/jpeg',
        encoding: '7bit',
        hash: '10',
        uploadedAt: new Date('2022-12-12T04:17:49.022Z'),
      },
    ];

    for (let i = 0; i < 11; i += 1) {
      await FileModel.create(files[i]); // eslint-disable-line no-await-in-loop
    }

    const entityFilesQuery = createEntityFilesQueryResolver(
      imageConfig,
      generalConfig,
      serversideConfig,
    );
    if (!entityFilesQuery) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const allFiles = await entityFilesQuery(
      null,
      { where: {} },
      { mongooseConn, pubsub },
      { projection: { desktop: 1, tablet: 1, mobile: 1 } },
    );

    const entityFilesThroughConnection = createEntityFilesThroughConnectionQueryResolver(
      imageConfig,
      generalConfig,
      serversideConfig,
    );

    if (!entityFilesThroughConnection) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const examples = await entityFilesThroughConnection(
      null,
      { first: 3 },
      { mongooseConn },
      { projection: { desktop: 1, tablet: 1, mobile: 1 } },
      [],
    );

    const {
      pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor },
      edges,
    } = examples;

    expect(hasPreviousPage).toBe(false);
    expect(hasNextPage).toBe(true);
    expect(startCursor).toBe(toCursor(allFiles[0].id, 0));
    const lastPos = edges.length - 1;
    expect(endCursor).toBe(toCursor(allFiles[lastPos].id, lastPos));

    for (let i = 0; i < edges.length; i += 1) {
      const { node, cursor } = edges[i];

      expect(node).toEqual(allFiles[i]);
      expect(cursor).toBe(toCursor(allFiles[i].id, i));
    }

    const examples2 = await entityFilesThroughConnection(
      null,
      { first: 5, after: endCursor },
      { mongooseConn },
      { projection: { desktop: 1, tablet: 1, mobile: 1 } },
      [],
    );

    const {
      pageInfo: {
        hasNextPage: hasNextPage2,
        hasPreviousPage: hasPreviousPage2,
        startCursor: startCursor2,
        endCursor: endCursor2,
      },
      edges: edges2,
    } = examples2;

    expect(hasPreviousPage2).toBe(true);
    expect(hasNextPage2).toBe(true);
    expect(startCursor2).toBe(toCursor(allFiles[lastPos + 1].id, lastPos + 1));
    const lastPos2 = lastPos + edges2.length;
    expect(endCursor2).toBe(toCursor(allFiles[lastPos2].id, lastPos2));

    expect(edges2.length).toBe(5);

    for (let i = 0; i < edges2.length; i += 1) {
      const { node, cursor } = edges2[i];

      expect(node).toEqual(allFiles[lastPos + i + 1]);
      expect(cursor).toBe(toCursor(allFiles[lastPos + i + 1].id, lastPos + i + 1));
    }

    const examples3 = await entityFilesThroughConnection(
      null,
      { first: 5, after: endCursor2 },
      { mongooseConn },
      { projection: { desktop: 1, tablet: 1, mobile: 1 } },
      [],
    );

    const {
      pageInfo: {
        hasNextPage: hasNextPage3,
        hasPreviousPage: hasPreviousPage3,
        startCursor: startCursor3,
        endCursor: endCursor3,
      },
      edges: edges3,
    } = examples3;

    expect(hasPreviousPage3).toBe(true);
    expect(hasNextPage3).toBe(false);
    expect(startCursor3).toBe(toCursor(allFiles[lastPos2 + 1].id, lastPos2 + 1));
    const lastPos3 = lastPos2 + edges3.length;
    expect(endCursor3).toBe(toCursor(allFiles[lastPos3].id, lastPos3));

    expect(edges3.length).toBe(3);

    for (let i = 0; i < edges3.length; i += 1) {
      const { node, cursor } = edges3[i];

      expect(node).toEqual(allFiles[lastPos2 + i + 1]);
      expect(cursor).toBe(toCursor(allFiles[lastPos2 + i + 1].id, lastPos2 + i + 1));
    }

    const examples4 = await entityFilesThroughConnection(
      null,
      { last: 5, before: startCursor3 },
      { mongooseConn },
      { projection: { desktop: 1, tablet: 1, mobile: 1 } },
      [],
    );

    const {
      pageInfo: {
        hasNextPage: hasNextPage4,
        hasPreviousPage: hasPreviousPage4,
        startCursor: startCursor4,
        endCursor: endCursor4,
      },
      edges: edges4,
    } = examples4;

    expect(hasPreviousPage4).toBe(true);
    expect(hasNextPage4).toBe(true);

    expect(startCursor4).toBe(toCursor(allFiles[3].id, 3));
    expect(endCursor4).toBe(toCursor(allFiles[7].id, 7));

    expect(edges4.length).toBe(5);

    for (let i = 0; i < edges4.length; i += 1) {
      const { node, cursor } = edges4[i];

      expect(node).toEqual(allFiles[i + 3]);
      expect(cursor).toBe(toCursor(allFiles[i + 3].id, i + 3));
    }

    const examples5 = await entityFilesThroughConnection(
      null,
      { last: 5, before: startCursor4 },
      { mongooseConn },
      { projection: { desktop: 1, tablet: 1, mobile: 1 } },
      [],
    );

    const {
      pageInfo: {
        hasNextPage: hasNextPage5,
        hasPreviousPage: hasPreviousPage5,
        startCursor: startCursor5,
        endCursor: endCursor5,
      },
      edges: edges5,
    } = examples5;

    expect(hasPreviousPage5).toBe(false);
    expect(hasNextPage5).toBe(true);

    expect(startCursor5).toBe(toCursor(allFiles[0].id, 0));
    expect(endCursor5).toBe(toCursor(allFiles[2].id, 2));

    expect(edges5.length).toBe(3);

    for (let i = 0; i < edges5.length; i += 1) {
      const { node, cursor } = edges5[i];

      expect(node).toEqual(allFiles[i]);
      expect(cursor).toBe(toCursor(allFiles[i].id, i));
    }
  });
});
