// @flow
/* eslint-env jest */
const mongoose = require('mongoose');

const createThingSchema = require('../../mongooseModels/createThingSchema');
const createCreateThingMutationResolver = require('./createCreateThingMutationResolver');

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-create-thing-mutation';
  mongooseConn = await mongoose.connect(dbURI, { useNewUrlParser: true });
  await mongooseConn.connection.db.dropDatabase();
});

describe('createCreateThingMutationResolver', () => {
  test('should create mutation add thing resolver', async () => {
    const thingConfig = {
      name: 'Example',
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
  test('should create mutation add thing resolver adding relations', async () => {
    const personConfig = { name: 'Person', textFields: [], relationalFields: [] };
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
      ],
      relationalFields: [
        {
          name: 'friend',
          config: personConfig,
        },
        {
          name: 'friends',
          config: personConfig,
          array: true,
        },
      ],
    });

    const createPerson = createCreateThingMutationResolver(personConfig);
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
  test('should create mutation add thing resolver that create related things', async () => {
    const cityConfig = { name: 'City', textFields: [{ name: 'name' }] };
    const placeConfig = {
      name: 'Place',
      textFields: [{ name: 'name' }],
      relationalFields: [{ name: 'capital', config: cityConfig }],
    };
    const personConfig = { name: 'Person', textFields: [], relationalFields: [] };
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
      ],
      relationalFields: [
        {
          name: 'friend',
          config: personConfig,
        },
        {
          name: 'friends',
          config: personConfig,
          array: true,
        },
        {
          name: 'location',
          config: placeConfig,
        },
        {
          name: 'favorities',
          config: placeConfig,
          array: true,
        },
      ],
    });

    const createPerson = createCreateThingMutationResolver(personConfig);
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
      friend: {
        create: {
          firstName: 'Adam',
          lastName: 'Smith',
        },
      },
      friends: {
        connect: [otherId],
        create: [
          {
            firstName: 'Fidel',
            lastName: 'Castro',
          },
          {
            firstName: 'Michel',
            lastName: 'Ortego',
          },
        ],
      },
      location: {
        create: {
          name: 'USA',
          capital: { create: { name: 'Washington' } },
        },
      },
      favorities: {
        create: [
          {
            name: 'Ukraine',
            capital: { create: { name: 'Kyiv' } },
          },
          {
            name: 'Grate Britan',
            capital: { create: { name: 'London' } },
          },
        ],
      },
    };
    const createdPerson2 = await createPerson(null, { data: data2 }, { mongooseConn });
    expect(createdPerson2.firstName).toBe(data2.firstName);
    expect(createdPerson2.lastName).toBe(data2.lastName);
    expect(createdPerson2.createdAt instanceof Date).toBeTruthy();
    expect(createdPerson2.updatedAt instanceof Date).toBeTruthy();

    const { friend: friendId, friends: friendIds } = createdPerson2;

    const personSchema = createThingSchema(personConfig);
    const Person = mongooseConn.model('Person', personSchema);
    const createdFriend = await Person.findById(friendId);
    expect(createdFriend.firstName).toBe(data2.friend.create.firstName);
    expect(createdFriend.lastName).toBe(data2.friend.create.lastName);
    expect(createdFriend.createdAt instanceof Date).toBeTruthy();
    expect(createdFriend.updatedAt instanceof Date).toBeTruthy();

    const createdFriends = await Person.find({ _id: { $in: friendIds } });
    expect(createdFriends[0].firstName).toBe(data.firstName);
    expect(createdFriends[0].lastName).toBe(data.lastName);
    expect(createdFriends[1].firstName).toBe(data2.friends.create[0].firstName);
    expect(createdFriends[1].lastName).toBe(data2.friends.create[0].lastName);
    expect(createdFriends[2].firstName).toBe(data2.friends.create[1].firstName);
    expect(createdFriends[2].lastName).toBe(data2.friends.create[1].lastName);
  });
});
