/* eslint-env jest */

import mongoose from 'mongoose';
import { PubSub } from 'graphql-subscriptions';

import mongoOptions from '../../../test/mongo-options';
import fieldArrayResolver from './index';

mongoose.set('strictQuery', false);

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-field-array-type';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

describe('createFieldArrayResolver', () => {
  test('should create type entity resolver', async () => {
    const parent = {
      title: 'Paris',
      features: ['Capital', 'Сultural', 'Historical', 'Gastronomic'],
    };

    const info = { fieldName: 'features' };

    const args = { slice: { begin: 1, end: 3 } };

    const selectedFeatures = await fieldArrayResolver(parent, args, { mongooseConn, pubsub }, info);

    expect(selectedFeatures).toEqual(['Сultural', 'Historical']);
  });
});
