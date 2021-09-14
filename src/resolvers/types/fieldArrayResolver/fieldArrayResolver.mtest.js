// @flow
/* eslint-env jest */

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../../test/mongo-options');
const { default: fieldArrayResolver } = require('./index');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-primitive-array-type';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

describe('createFieldArrayResolver', () => {
  test('should create type thing resolver', async () => {
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
