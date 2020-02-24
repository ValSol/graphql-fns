// @flow
/* eslint-env jest */
import type { GeneralConfig, ThingConfig } from '../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../test/mongo-options');
const { default: createThingSchema } = require('../../mongooseModels/createThingSchema');
const {
  default: createCreateThingMutationResolver,
} = require('./createCreateThingMutationResolver');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-create-thing-mutation';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

describe('createCreateThingMutationResolver', () => {
  const generalConfig: GeneralConfig = { thingConfigs: [] };
  const serversideConfig = {};
  test('should create mutation add thing resolver', async () => {
    const thingConfig: ThingConfig = {
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

    const createExample = createCreateThingMutationResolver(
      thingConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createExample).toBe('function');
    if (!createExample) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      textField1: 'textField1',
      textField2: 'textField2',
      textField3: 'textField3',
      textField4: ['textField4'],
      textField5: ['textField5'],
    };

    const createdExample = await createExample(null, { data }, { mongooseConn, pubsub });

    expect(createdExample.textField1).toBe(data.textField1);
    expect(createdExample.textField2).toBe(data.textField2);
    expect(createdExample.textField3).toBe(data.textField3);
    expect(createdExample.textField4).toEqual(data.textField4);
    expect(createdExample.textField5).toEqual(data.textField5);
    expect(createdExample.createdAt instanceof Date).toBeTruthy();
    expect(createdExample.updatedAt instanceof Date).toBeTruthy();
  });
  test('should create mutation add thing resolver adding relations', async () => {
    const personConfig: ThingConfig = {};
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

    const createPerson = createCreateThingMutationResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createPerson).toBe('function');
    if (!createPerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      firstName: 'Ivan',
      lastName: 'Fedorov',
    };

    const createdPerson = await createPerson(null, { data }, { mongooseConn, pubsub });
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
    const createdPerson2 = await createPerson(null, { data: data2 }, { mongooseConn, pubsub });
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
    const personConfig = {};
    Object.assign(personConfig, {
      name: 'Person2',
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

    const createPerson = createCreateThingMutationResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createPerson).toBe('function');
    if (!createPerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      firstName: 'Ivan',
      lastName: 'Fedorov',
    };

    const createdPerson = await createPerson(null, { data }, { mongooseConn, pubsub });
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
    const createdPerson2 = await createPerson(null, { data: data2 }, { mongooseConn, pubsub });
    expect(createdPerson2.firstName).toBe(data2.firstName);
    expect(createdPerson2.lastName).toBe(data2.lastName);
    expect(createdPerson2.createdAt instanceof Date).toBeTruthy();
    expect(createdPerson2.updatedAt instanceof Date).toBeTruthy();

    const { friend: friendId, friends: friendIds } = createdPerson2;

    const personSchema = createThingSchema(personConfig);
    const Person = mongooseConn.model('Person2Thing', personSchema);
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

  test('should create mutation add thing resolver that create duplex related things', async () => {
    const personConfig: ThingConfig = {};
    const placeConfig: ThingConfig = {
      name: 'Place2',
      textFields: [{ name: 'name' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          config: personConfig,
        },
        {
          name: 'visitors',
          oppositeName: 'favorities',
          array: true,
          config: personConfig,
        },
        {
          name: 'curator',
          oppositeName: 'locations',
          config: personConfig,
        },
      ],
    };
    Object.assign(personConfig, {
      name: 'Person3',
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
      duplexFields: [
        {
          name: 'friend',
          oppositeName: 'friend',
          config: personConfig,
          required: true,
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
        },
        {
          name: 'locations',
          oppositeName: 'curator',
          config: placeConfig,
          array: true,
        },
        {
          name: 'favorities',
          oppositeName: 'visitors',
          config: placeConfig,
          array: true,
        },
      ],
    });

    const createPerson = createCreateThingMutationResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createPerson).toBe('function');
    if (!createPerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      firstName: 'Hugo',
      lastName: 'Boss',
      friend: {
        create: {
          firstName: 'Adam',
          lastName: 'Mamedov',
          location: {
            create: {
              name: 'Belarus',
            },
          },
        },
      },
      location: {
        create: {
          name: 'USA',
        },
      },
      locations: {
        create: [
          {
            name: 'China',
          },
          {
            name: 'Ukraine',
          },
        ],
      },
      favorities: {
        create: [
          {
            name: 'Australia',
          },
          {
            name: 'Grate Britan',
          },
        ],
      },
    };
    const createdPerson = await createPerson(null, { data }, { mongooseConn, pubsub });
    expect(createdPerson.firstName).toBe(data.firstName);
    expect(createdPerson.lastName).toBe(data.lastName);
    expect(createdPerson.createdAt instanceof Date).toBeTruthy();
    expect(createdPerson.updatedAt instanceof Date).toBeTruthy();

    const {
      friend: friendId,
      _id,
      location: locationId,
      locations: locationIds,
      favorities: favoritieIds,
    } = createdPerson;

    const personSchema = createThingSchema(personConfig);
    const Person = mongooseConn.model('Person3Thing', personSchema);
    const placeSchema = createThingSchema(placeConfig);
    const Place = mongooseConn.model('Place2Thing', placeSchema);

    const createdFriend = await Person.findById(friendId);
    expect(createdFriend.firstName).toBe(data.friend.create.firstName);
    expect(createdFriend.lastName).toBe(data.friend.create.lastName);
    expect(createdFriend.friend).toEqual(_id);
    expect(createdFriend.createdAt instanceof Date).toBeTruthy();
    expect(createdFriend.updatedAt instanceof Date).toBeTruthy();

    const createdFriendLocation = await Place.findById(createdFriend.location);
    expect(createdFriendLocation.name).toBe(data.friend.create.location.create.name);
    // eslint-disable-next-line no-underscore-dangle
    expect(createdFriendLocation.citizens[0]).toEqual(createdFriend._id);

    const createdLocation = await Place.findById(locationId);
    expect(createdLocation.name).toBe(data.location.create.name);
    expect(createdLocation.citizens[0]).toEqual(_id);
    expect(createdLocation.createdAt instanceof Date).toBeTruthy();
    expect(createdLocation.updatedAt instanceof Date).toBeTruthy();

    const createdLocations = await Place.find({ _id: { $in: locationIds } });
    expect(createdLocations[0].name).toBe(data.locations.create[0].name);
    expect(createdLocations[0].curator).toEqual(_id);
    expect(createdLocations[1].name).toBe(data.locations.create[1].name);
    expect(createdLocations[1].curator).toEqual(_id);

    const createdFavorities = await Place.find({ _id: { $in: favoritieIds } });
    expect(createdFavorities[0].name).toBe(data.favorities.create[0].name);
    expect(createdFavorities[0].visitors[0]).toEqual(_id);
    expect(createdFavorities[1].name).toBe(data.favorities.create[1].name);
    expect(createdFavorities[1].visitors[0]).toEqual(_id);

    const data2 = {
      firstName: 'Nina',
      lastName: 'Richi',
      friend: {
        connect: _id.toString(),
      },
      location: {
        connect: locationId.toString(),
      },
      locations: {
        connect: [locationIds[0].toString(), locationIds[1].toString()],
      },
      favorities: {
        connect: [favoritieIds[0].toString(), favoritieIds[1].toString()],
      },
    };

    const createdPerson2 = await createPerson(null, { data: data2 }, { mongooseConn, pubsub });
    expect(createdPerson2.firstName).toBe(data2.firstName);
    expect(createdPerson2.lastName).toBe(data2.lastName);
    expect(createdPerson.createdAt instanceof Date).toBeTruthy();
    expect(createdPerson.updatedAt instanceof Date).toBeTruthy();

    const {
      friend: friendId2,
      _id: _id2,
      location: locationId2,
      locations: locationIds2,
      favorities: favoritieIds2,
    } = createdPerson2;

    expect(friendId2).toEqual(_id);
    expect(locationId2).toEqual(locationId);
    expect(locationIds2).toEqual(locationIds);
    expect(favoritieIds2).toEqual(favoritieIds);

    const createdFriend2 = await Person.findById(friendId2);
    expect(createdFriend2.firstName).toBe(data.firstName);
    expect(createdFriend2.lastName).toBe(data.lastName);
    expect(createdFriend2.friend).toEqual(_id2);

    const createdLocation2 = await Place.findById(locationId2);
    expect(createdLocation2.citizens[1]).toEqual(_id2);

    const createdLocations2 = await Place.find({ _id: { $in: locationIds2 } });
    expect(createdLocations2[0].curator).toEqual(_id2);
    expect(createdLocations2[1].curator).toEqual(_id2);

    const createdFavorities2 = await Place.find({ _id: { $in: favoritieIds2 } });
    expect(createdFavorities2[0].visitors[1]).toEqual(_id2);
    expect(createdFavorities2[1].visitors[1]).toEqual(_id2);
  });

  test('should update mongodb documents using periphery objects', async () => {
    const personConfig: ThingConfig = {};
    const placeConfig: ThingConfig = {
      name: 'Place3',
      textFields: [{ name: 'name' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          config: personConfig,
        },
        {
          name: 'curator',
          oppositeName: 'locations',
          config: personConfig,
        },
      ],
    };
    Object.assign(personConfig, {
      name: 'Person4',
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
      duplexFields: [
        {
          name: 'friend',
          oppositeName: 'friend',
          config: personConfig,
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
        },
        {
          name: 'locations',
          oppositeName: 'curator',
          config: placeConfig,
          array: true,
        },
      ],
    });

    const createPerson = createCreateThingMutationResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createPerson).toBe('function');
    if (!createPerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      firstName: 'Hugo',
      lastName: 'Boss',
      friend: {
        create: {
          firstName: 'Adam',
          lastName: 'Mamedov',
          location: {
            create: {
              name: 'Belarus',
            },
          },
        },
      },
      location: {
        create: {
          name: 'USA',
        },
      },
      locations: {
        create: [
          {
            name: 'China',
          },
          {
            name: 'Ukraine',
          },
        ],
      },
    };
    const createdPerson = await createPerson(null, { data }, { mongooseConn, pubsub });
    expect(createdPerson.firstName).toBe(data.firstName);
    expect(createdPerson.lastName).toBe(data.lastName);
    expect(createdPerson.locations.length).toBe(2);
    expect(createdPerson.createdAt instanceof Date).toBeTruthy();
    expect(createdPerson.updatedAt instanceof Date).toBeTruthy();

    const { friend: friendId, _id, location: locationId, locations: locationIds } = createdPerson;

    const personSchema = createThingSchema(personConfig);
    const Person = mongooseConn.model('Person4Thing', personSchema);
    const placeSchema = createThingSchema(placeConfig);
    const Place = mongooseConn.model('Place3Thing', placeSchema);

    const createdFriend = await Person.findById(friendId);
    expect(createdFriend.firstName).toBe(data.friend.create.firstName);
    expect(createdFriend.lastName).toBe(data.friend.create.lastName);
    expect(createdFriend.friend).toEqual(_id);
    expect(createdFriend.createdAt instanceof Date).toBeTruthy();
    expect(createdFriend.updatedAt instanceof Date).toBeTruthy();

    const createdFriendLocation = await Place.findById(createdFriend.location);
    expect(createdFriendLocation.name).toBe(data.friend.create.location.create.name);
    // eslint-disable-next-line no-underscore-dangle
    expect(createdFriendLocation.citizens[0]).toEqual(createdFriend._id);

    const createdLocation = await Place.findById(locationId);
    expect(createdLocation.name).toBe(data.location.create.name);
    expect(createdLocation.citizens[0]).toEqual(_id);
    expect(createdLocation.createdAt instanceof Date).toBeTruthy();
    expect(createdLocation.updatedAt instanceof Date).toBeTruthy();

    const createdLocations = await Place.find({ _id: { $in: locationIds } });
    expect(createdLocations[0].name).toBe(data.locations.create[0].name);
    expect(createdLocations[0].curator).toEqual(_id);
    expect(createdLocations[1].name).toBe(data.locations.create[1].name);
    expect(createdLocations[1].curator).toEqual(_id);

    const data2 = {
      firstName: 'Nina',
      lastName: 'Richi',
      friend: {
        connect: _id,
      },
      location: {
        connect: locationId,
      },
      locations: {
        connect: [locationIds[0], locationIds[1]],
      },
    };

    const createdPerson2 = await createPerson(null, { data: data2 }, { mongooseConn, pubsub });
    expect(createdPerson2.firstName).toBe(data2.firstName);
    expect(createdPerson2.lastName).toBe(data2.lastName);
    expect(createdPerson.createdAt instanceof Date).toBeTruthy();
    expect(createdPerson.updatedAt instanceof Date).toBeTruthy();

    const connectedFriend = await Person.findById(createdPerson2.friend);
    expect(connectedFriend.firstName).toBe(data.firstName);
    expect(connectedFriend.lastName).toBe(data.lastName);
    expect(connectedFriend.locations.length).toBe(0);

    const oldCreatedFriend = await Person.findById(friendId);
    expect(oldCreatedFriend.friend).toBeUndefined();
  });
});
