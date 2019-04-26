// @flow
/* eslint-env jest */
const mongoose = require('mongoose');

const createThingSchema = require('../../mongooseModels/createThingSchema');
const createCreateThingMutationResolver = require('./createCreateThingMutationResolver');
const createUpdateThingMutationResolver = require('./createUpdateThingMutationResolver');

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-update-thing-mutation';
  mongooseConn = await mongoose.connect(dbURI, { useNewUrlParser: true });
  await mongooseConn.connection.db.dropDatabase();
});

describe('createUpdateThingMutationResolver', () => {
  test('should create mutation delete thing resolver with wipe out duplex fields values', async () => {
    const personConfig = {
      name: 'Person',
      textFields: [],
      duplexFields: [],
    };
    const placeConfig = {
      name: 'Place',
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

    const createPerson = createCreateThingMutationResolver(personConfig);

    expect(typeof createPerson).toBe('function');

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
    const createdPerson = await createPerson(null, { data }, { mongooseConn });
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
    const Person = mongooseConn.model('Person', personSchema);
    const placeSchema = createThingSchema(placeConfig);
    const Place = mongooseConn.model('Place', placeSchema);

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

    const updatePerson = createUpdateThingMutationResolver(personConfig);
    const where = { id: _id };
    const data2 = { firstName: 'Vasya', lastName: 'Pupkin' };
    const updatedPerson = await updatePerson(null, { where, data: data2 }, { mongooseConn });
    expect(updatedPerson.firstName).toBe(data2.firstName);
    expect(updatedPerson.lastName).toBe(data2.lastName);
    /*
    const createdFriend2 = await Person.findById(friendId);
    expect(createdFriend2.friend).toBeUndefined();

    const createdLocation2 = await Place.findById(locationId);
    expect(createdLocation2.citizens.length).toEqual(0);

    const createdLocations2 = await Place.find({ _id: { $in: locationIds } });
    expect(createdLocations2[0].curator).toBeUndefined();
    expect(createdLocations2[1].curator).toBeUndefined();

    const createdFavorities2 = await Place.find({ _id: { $in: favoritieIds } });
    expect(createdFavorities2[0].visitors.length).toEqual(0);
    expect(createdFavorities2[1].visitors.length).toEqual(0);

    const deletedPerson2 = await updatePerson(null, { where }, { mongooseConn });
    expect(deletedPerson2).toBeNull();
    */
  });
});
