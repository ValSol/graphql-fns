/* eslint-env jest */

import mongoose from 'mongoose';

import mongoOptions from '../../../test/mongo-options';
import pubsub from '../../utils/pubsub';
import fieldArrayResolver from './index';

mongoose.set('strictQuery', false);

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-field-array-type';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
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

    const info = { projection: { _id: 1 }, fieldArgs: {}, path: [], fieldName: 'features' };

    const args = { slice: { begin: 1, end: 3 } };

    const selectedFeatures = await fieldArrayResolver(parent, args, { mongooseConn, pubsub }, info);

    expect(selectedFeatures).toEqual(['Сultural', 'Historical']);
  });
});
