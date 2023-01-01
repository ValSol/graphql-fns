// @flow
/* eslint-env jest */
import type { GeneralConfig, EntityConfig } from '../../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../../test/mongo-options');
const { default: createThingSchema } = require('../../../mongooseModels/createThingSchema');
const {
  default: createCreateEntityMutationResolver,
} = require('../createCreateEntityMutationResolver');
const { default: createDeleteEntityMutationResolver } = require('./index');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-delete-entity-mutation';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('createDeleteEntityMutationResolver', () => {
  const generalConfig: GeneralConfig = { allEntityConfigs: {} };
  test('should create mutation delete entity resolver with wipe out duplex fields values', async () => {
    const personConfig: EntityConfig = {};
    const placeConfig: EntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name', unique: true }],
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
      type: 'tangible',
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

    const personSchema = createThingSchema(personConfig);
    const Person = mongooseConn.model('Person_Thing', personSchema);
    await Person.createCollection();

    const placeSchema = createThingSchema(placeConfig);
    const Place = mongooseConn.model('Place_Thing', placeSchema);
    await Place.createCollection();

    const serversideConfig = { transactions: true };
    const createPerson = createCreateEntityMutationResolver(
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
    const createdPerson = await createPerson(null, { data }, { mongooseConn, pubsub }, null, {
      foo: [],
    });
    expect(createdPerson.firstName).toBe(data.firstName);
    expect(createdPerson.lastName).toBe(data.lastName);
    expect(createdPerson.createdAt instanceof Date).toBeTruthy();
    expect(createdPerson.updatedAt instanceof Date).toBeTruthy();

    const {
      friend: friendId,
      id,
      location: locationId,
      locations: locationIds,
      favorities: favoritieIds,
    } = createdPerson;

    const createdFriend = await Person.findById(friendId);
    expect(createdFriend.firstName).toBe(data.friend.create.firstName);
    expect(createdFriend.lastName).toBe(data.friend.create.lastName);
    expect(createdFriend.friend).toEqual(id);
    expect(createdFriend.createdAt instanceof Date).toBeTruthy();
    expect(createdFriend.updatedAt instanceof Date).toBeTruthy();

    const createdFriendLocation = await Place.findById(createdFriend.location);
    expect(createdFriendLocation.name).toBe(data.friend.create.location.create.name);
    // eslint-disable-next-line no-underscore-dangle
    expect(createdFriendLocation.citizens[0]).toEqual(createdFriend._id);

    const createdLocation = await Place.findById(locationId);
    expect(createdLocation.name).toBe(data.location.create.name);
    expect(createdLocation.citizens[0]).toEqual(id);
    expect(createdLocation.createdAt instanceof Date).toBeTruthy();
    expect(createdLocation.updatedAt instanceof Date).toBeTruthy();

    const createdLocations = await Place.find({ _id: { $in: locationIds } });
    expect(createdLocations[0].name).toBe(data.locations.create[0].name);
    expect(createdLocations[0].curator).toEqual(id);
    expect(createdLocations[1].name).toBe(data.locations.create[1].name);
    expect(createdLocations[1].curator).toEqual(id);

    const createdFavorities = await Place.find({ _id: { $in: favoritieIds } });
    expect(createdFavorities[0].name).toBe(data.favorities.create[0].name);
    expect(createdFavorities[0].visitors[0]).toEqual(id);
    expect(createdFavorities[1].name).toBe(data.favorities.create[1].name);
    expect(createdFavorities[1].visitors[0]).toEqual(id);

    const deletePerson = createDeleteEntityMutationResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    if (!deletePerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const whereOne = { id };
    const deletedPerson = await deletePerson(null, { whereOne }, { mongooseConn, pubsub }, null, {
      foo: [],
    });
    expect(deletedPerson.firstName).toBe(data.firstName);
    expect(deletedPerson.lastName).toBe(data.lastName);

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

    const deletedPerson2 = await deletePerson(null, { whereOne }, { mongooseConn, pubsub }, null, {
      foo: [],
    });
    expect(deletedPerson2).toBeNull();

    const deletePlace = createDeleteEntityMutationResolver(
      placeConfig,
      generalConfig,
      serversideConfig,
    );
    if (!deletePlace) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const where2 = { name: data.location.create.name };
    const deletedPlace = await deletePlace(
      null,
      { whereOne: where2 },
      { mongooseConn, pubsub },
      null,
      { foo: [] },
    );
    expect(deletedPlace.name).toBe(data.location.create.name);

    const deletedPlace2 = await deletePlace(
      null,
      { whereOne: where2 },
      { mongooseConn, pubsub },
      null,
      { foo: [] },
    );
    expect(deletedPlace2).toBeNull();
  });

  test('should create mutation deleteEntity resolver to aggregate result', async () => {
    const serversideConfig = { transactions: true };

    const childConfig: EntityConfig = {
      name: 'Child',
      type: 'tangible',
      textFields: [
        {
          name: 'textFields',
          array: true,
          index: true,
        },
        {
          name: 'textField',
          index: true,
        },
      ],
    };
    const parentConfig: EntityConfig = {
      name: 'Parent',
      type: 'tangible',
      textFields: [
        {
          name: 'name',
          index: true,
          weight: 1,
        },
      ],

      relationalFields: [
        {
          name: 'child',
          index: true,
          config: childConfig,
        },
      ],
    };

    const parentSchema = createThingSchema(parentConfig);
    const Parent = mongooseConn.model('Parent_Thing', parentSchema);
    await Parent.createCollection();

    const childSchema = createThingSchema(childConfig);
    const Child = mongooseConn.model('Child_Thing', childSchema);
    await Child.createCollection();

    const createParent = createCreateEntityMutationResolver(
      parentConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createParent).toBe('function');
    if (!createParent) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    for (let i = 0; i < 20; i += 1) {
      const data = {
        name: `name-${i}`,
        child: {
          create: {
            textFields: [`text-${i}`],
            textField: i < 15 ? 'first' : 'second',
          },
        },
      };
      // eslint-disable-next-line no-await-in-loop
      await createParent(null, { data }, { mongooseConn, pubsub }, null, { foo: [] });
    }

    const deletePerson = createDeleteEntityMutationResolver(
      parentConfig,
      generalConfig,
      serversideConfig,
    );
    if (!deletePerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const whereOne = {
      AND: [
        { name: 'name-2' },
        { child_: { textFields_in: ['text-2', 'text-4', 'text-12', 'text-99'] } },
      ],
    };

    const info = { projection: { _id: 1, name: 1 } };
    const deletedParent = await deletePerson(null, { whereOne }, { mongooseConn, pubsub }, info, {
      foo: [],
    });

    expect(deletedParent.name).toBe('name-2');

    const whereOne2 = {
      AND: [
        { name: 'name-1' },
        { child_: { textFields_in: ['text-2', 'text-4', 'text-12', 'text-99'] } },
      ],
    };

    const deletedParent2 = await deletePerson(
      null,
      { whereOne: whereOne2 },
      { mongooseConn, pubsub },
      info,
      { foo: [] },
    );

    expect(deletedParent2).toBe(null);
  });
});
