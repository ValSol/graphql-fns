// @flow
/* eslint-env jest */
const mongoose = require('mongoose');

const createCreateThingMutationResolver = require('../mutations/createCreateThingMutationResolver');
const info = require('../info.auxiliary.js');
const createThingsQueryResolver = require('./createThingsQueryResolver');

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-create-thing-query';
  mongooseConn = await mongoose.connect(dbURI, { useNewUrlParser: true });
  await mongooseConn.connection.db.dropDatabase();
});

describe('createThingQueryResolver', () => {
  test('should create query thing resolver', async () => {
    const personConfig = {
      name: 'Person',
      textFields: [],
      duplexFields: [],
    };
    Object.assign(personConfig, {
      name: 'Person',
      textFields: [
        {
          name: 'firstName',
          required: true,
        },
        {
          name: 'lastName',
          required: true,
        },
        {
          name: 'position',
          index: true,
        },
      ],
      duplexFields: [
        {
          name: 'friends',
          array: true,
          oppositeName: 'friends',
          config: personConfig,
        },
        {
          name: 'theBestFriend',
          oppositeName: 'theBestFriend',
          config: personConfig,
        },
      ],
    });

    const createPerson = createCreateThingMutationResolver(personConfig);
    expect(typeof createPerson).toBe('function');

    const data = {
      firstName: 'Hugo',
      lastName: 'Boss',
      position: 'boss',
      friends: {
        create: [
          { firstName: 'Adam', lastName: 'Mashkin', position: 'programmer' },
          { firstName: 'Andy', lastName: 'Daskin', position: 'programmer' },
          { firstName: 'Fred', lastName: 'Prashkin', position: 'programmer' },
        ],
      },
      theBestFriend: {
        create: {
          firstName: 'Stanislav',
          lastName: 'Bzhezinsky',
          position: 'programmer',
        },
      },
    };
    const createdPerson = await createPerson(null, { data }, { mongooseConn });

    const People = createThingsQueryResolver(personConfig);

    const people = await People(null, {}, { mongooseConn }, info);

    expect(people.length).toBe(5);
    expect(people[0].id).toEqual(createdPerson.id);

    const where = { position: data.theBestFriend.create.position };
    const people2 = await People(null, { where }, { mongooseConn }, info);

    expect(people2.length).toBe(4);

    const where2 = { friends: createdPerson.id };
    const people3 = await People(null, { where: where2 }, { mongooseConn }, info);

    expect(people3.length).toBe(3);
  });
});
