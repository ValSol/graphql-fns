// @flow
/* eslint-env jest */
const mongoose = require('mongoose');

const createCreateThingMutationResolver = require('./createCreateThingMutationResolver');

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-create-thing-mutation';
  mongooseConn = await mongoose.connect(dbURI, { useNewUrlParser: true });
  await mongooseConn.connection.db.dropDatabase();
});

describe('createCreateThingMutationResolver', () => {
  test.skip('should create mutation add thing resolver', async () => {
    const thingConfig = {
      thingName: 'Example',
      textFields: [
        {
          name: 'textField1',
        },
        {
          name: 'textField2',
          default: 'default text',
        },
        {
          name: 'textField3',
          required: true,
        },
        {
          name: 'textField4',
          array: true,
        },
        {
          name: 'textField5',
          default: ['default text'],
          required: true,
          array: true,
        },
      ],
    };

    const createExample = createCreateThingMutationResolver(thingConfig);
    expect(typeof createExample).toBe('function');
    const data = {
      textField1: 'textField1',
      textField2: 'textField2',
      textField3: 'textField3',
      textField4: ['textField4'],
      textField5: ['textField5'],
    };

    const createdExample = await createExample(null, { data }, { mongooseConn });

    expect(createdExample.textField1).toBe(data.textField1);
    expect(createdExample.textField2).toBe(data.textField2);
    expect(createdExample.textField3).toBe(data.textField3);
    expect(createdExample.textField4).toEqual(data.textField4);
    expect(createdExample.textField5).toEqual(data.textField5);
    expect(createdExample.createdAt instanceof Date).toBeTruthy();
    expect(createdExample.updatedAt instanceof Date).toBeTruthy();
  });
  test('should create mutation add thing resolver', async () => {
    const thingConfig = {
      thingName: 'Person',
      textFields: [
        {
          name: 'firstName',
          required: true,
        },
        {
          name: 'lastName',
          required: true,
        },
      ],
      relationalFields: [
        {
          name: 'friend',
          thingName: 'Person',
        },
        {
          name: 'friends',
          thingName: 'Person',
          array: true,
        },
      ],
    };

    const createPerson = createCreateThingMutationResolver(thingConfig);
    expect(typeof createPerson).toBe('function');
    const data = {
      firstName: 'Ivan',
      lastName: 'Fedorov',
    };

    const createdPerson = await createPerson(null, { data }, { mongooseConn });
    expect(createdPerson.firstName).toBe(data.firstName);
    expect(createdPerson.lastName).toBe(data.lastName);
    expect(createdPerson.createdAt instanceof Date).toBeTruthy();
    expect(createdPerson.updatedAt instanceof Date).toBeTruthy();

    const { id } = createdPerson;
    const otherId = id.toString();

    const data2 = {
      firstName: 'Jim',
      lastName: 'Jonson',
      friend: { connect: otherId },
      friends: { connect: [otherId] },
    };
    const createdPerson2 = await createPerson(null, { data: data2 }, { mongooseConn });
    expect(createdPerson2.firstName).toBe(data2.firstName);
    expect(createdPerson2.lastName).toBe(data2.lastName);
    expect(createdPerson2.createdAt instanceof Date).toBeTruthy();
    expect(createdPerson2.updatedAt instanceof Date).toBeTruthy();
    expect(createdPerson2.friend.toString()).toBe(data2.friend.connect.toString());
    expect(createdPerson2.friends[0].toString()).toBe(data2.friends.connect[0].toString());
  });
});
