// @flow
/* eslint-env jest */
/* eslint no-underscore-dangle: 0 */
import type { GeneralConfig, ThingConfig } from '../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../test/mongo-options');
const { default: createThingSchema } = require('../../mongooseModels/createThingSchema');
const {
  default: createCreateThingMutationResolver,
} = require('./createCreateThingMutationResolver');
const {
  default: createUpdateThingMutationResolver,
} = require('./createUpdateThingMutationResolver');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-update-thing-mutation';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

describe('createUpdateThingMutationResolver', () => {
  const generalConfig: GeneralConfig = { thingConfigs: [] };
  const serversideConfig = {};
  test('should create mutation update thing resolver with wipe out duplex fields values', async () => {
    const personConfig: ThingConfig = {};
    const placeConfig: ThingConfig = {
      name: 'Place',
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
      id,
      location: locationId,
      locations: locationIds,
      favorities: favoritieIds,
    } = createdPerson;

    const personSchema = createThingSchema(personConfig);
    const Person = mongooseConn.model('PersonThing', personSchema);
    const placeSchema = createThingSchema(placeConfig);
    const Place = mongooseConn.model('PlaceThing', placeSchema);

    const createdFriend = await Person.findById(friendId);
    expect(createdFriend.firstName).toBe(data.friend.create.firstName);
    expect(createdFriend.lastName).toBe(data.friend.create.lastName);
    expect(createdFriend.friend).toEqual(id);
    expect(createdFriend.createdAt instanceof Date).toBeTruthy();
    expect(createdFriend.updatedAt instanceof Date).toBeTruthy();

    const createdFriendLocation = await Place.findById(createdFriend.location);
    expect(createdFriendLocation.name).toBe(data.friend.create.location.create.name);
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

    const data2 = {
      firstName: 'Mark',
      lastName: 'Tven',
      friend: {
        create: {
          firstName: 'Karl',
          lastName: 'Marx',
          location: {
            create: {
              name: 'German',
            },
          },
        },
      },
      location: {
        create: {
          name: 'Canada',
        },
      },
      locations: {
        create: [
          {
            name: 'Egipt',
          },
          {
            name: 'Siria',
          },
        ],
      },
      favorities: {
        create: [
          {
            name: 'Sudan',
          },
          {
            name: 'Marocco',
          },
        ],
      },
    };
    const createdPerson2 = await createPerson(null, { data: data2 }, { mongooseConn, pubsub });
    expect(createdPerson2.firstName).toBe(data2.firstName);
    expect(createdPerson2.lastName).toBe(data2.lastName);
    expect(createdPerson2.createdAt instanceof Date).toBeTruthy();
    expect(createdPerson2.updatedAt instanceof Date).toBeTruthy();

    const {
      friend: friendId2,
      id: id2,
      location: locationId2,
      locations: locationIds2,
      favorities: favoritieIds2,
    } = createdPerson2;

    const createdFriend2 = await Person.findById(friendId2);
    expect(createdFriend2.firstName).toBe(data2.friend.create.firstName);
    expect(createdFriend2.lastName).toBe(data2.friend.create.lastName);
    expect(createdFriend2.friend).toEqual(id2);
    expect(createdFriend2.createdAt instanceof Date).toBeTruthy();
    expect(createdFriend2.updatedAt instanceof Date).toBeTruthy();

    const createdFriendLocation2 = await Place.findById(createdFriend2.location);
    expect(createdFriendLocation2.name).toBe(data2.friend.create.location.create.name);
    // eslint-disable-next-line
    expect(createdFriendLocation2.citizens[0]).toEqual(createdFriend2._id);

    const createdLocation2 = await Place.findById(locationId2);
    expect(createdLocation2.name).toBe(data2.location.create.name);
    expect(createdLocation2.citizens[0]).toEqual(id2);
    expect(createdLocation2.createdAt instanceof Date).toBeTruthy();
    expect(createdLocation2.updatedAt instanceof Date).toBeTruthy();

    const createdLocations2 = await Place.find({ _id: { $in: locationIds2 } });
    expect(createdLocations2[0].name).toBe(data2.locations.create[0].name);
    expect(createdLocations2[0].curator).toEqual(id2);
    expect(createdLocations2[1].name).toBe(data2.locations.create[1].name);
    expect(createdLocations2[1].curator).toEqual(id2);

    const createdFavorities2 = await Place.find({ _id: { $in: favoritieIds2 } });
    expect(createdFavorities2[0].name).toBe(data2.favorities.create[0].name);
    expect(createdFavorities2[0].visitors[0]).toEqual(id2);
    expect(createdFavorities2[1].name).toBe(data2.favorities.create[1].name);
    expect(createdFavorities2[1].visitors[0]).toEqual(id2);

    const updatePerson = createUpdateThingMutationResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    if (!updatePerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const whereOne = { id };
    const dataForUpdate = {
      firstName: 'Vasya',
      lastName: 'Pupkin',
      friend: { connect: createdFriend2._id },
      location: { connect: createdLocation2._id },
      locations: { connect: [createdLocations2[0]._id, createdLocations2[1]._id] },
      favorities: { connect: [createdFavorities2[0]._id, createdFavorities2[1]._id] },
    };
    const updatedPerson = await updatePerson(
      null,
      { whereOne, data: dataForUpdate },
      { mongooseConn, pubsub },
    );
    expect(updatedPerson.firstName).toBe(dataForUpdate.firstName);
    expect(updatedPerson.lastName).toBe(dataForUpdate.lastName);
    const {
      friend: friendId3,
      id: id3,
      location: locationId3,
      locations: locationIds3,
      favorities: favoritieIds3,
    } = updatedPerson;

    expect(id).toEqual(id3);

    const updatedFriend = await Person.findById(friendId3);
    expect(updatedFriend.friend).toEqual(id3);

    const previousFriend = await Person.findById(friendId);
    expect(previousFriend.friend).toBeUndefined();

    const updatedLocation = await Place.findById(locationId3);
    expect(updatedLocation.citizens.length).toBe(2);

    expect(updatedLocation.citizens[0]).toEqual(id2);
    expect(updatedLocation.citizens[1]).toEqual(id);

    const updatedLocations = await Place.find({ _id: { $in: locationIds3 } });
    expect(updatedLocations[0].curator).toEqual(id);
    expect(updatedLocations[1].curator).toEqual(id);

    const updatedFavorities = await Place.find({ _id: { $in: favoritieIds3 } });
    expect(updatedFavorities[0].visitors.length).toBe(2);
    expect(updatedFavorities[0].visitors[0]).toEqual(id2);
    expect(updatedFavorities[0].visitors[1]).toEqual(id);
    expect(updatedFavorities[1].visitors.length).toBe(2);
    expect(updatedFavorities[1].visitors[0]).toEqual(id2);
    expect(updatedFavorities[1].visitors[1]).toEqual(id);

    const updatedPerson2 = await Person.findById(id2);
    const {
      friend: updatedFriendId2,
      location: updatedLocationId2,
      locations: updatedLocationsId2,
      favorities: updatedFavoritieIds2,
    } = updatedPerson2;

    expect(updatedFriendId2).toBeUndefined();

    const updatedLocation2 = await Place.findById(updatedLocationId2);
    expect(updatedLocation2.citizens.length).toBe(2);
    expect(updatedLocation2.citizens[0]).toEqual(id2);
    expect(updatedLocation2.citizens[1]).toEqual(id);

    const updatedLocations2 = await Place.find({ _id: { $in: updatedLocationsId2 } });
    expect(updatedLocations2.length).toBe(0);

    const updatedFavorities2 = await Place.find({ _id: { $in: updatedFavoritieIds2 } });
    expect(updatedFavorities2[0].visitors.length).toBe(2);
    expect(updatedFavorities2[0].visitors[0]).toEqual(id2);
    expect(updatedFavorities2[0].visitors[1]).toEqual(id);
    expect(updatedFavorities2[1].visitors.length).toBe(2);
    expect(updatedFavorities2[1].visitors[0]).toEqual(id2);
    expect(updatedFavorities2[1].visitors[1]).toEqual(id);

    const updatePlace = createUpdateThingMutationResolver(
      placeConfig,
      generalConfig,
      serversideConfig,
    );
    if (!updatePlace) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const whereOne2 = { name: data.location.create.name };
    const dataForUpdate2 = { name: 'Mexico' };
    const updatedPlace = await updatePlace(
      null,
      { whereOne: whereOne2, data: dataForUpdate2 },
      { mongooseConn, pubsub },
    );

    expect(updatedPlace.name).toBe(dataForUpdate2.name);

    const updatedPlace2 = await updatePlace(
      null,
      { whereOne: whereOne2, data: dataForUpdate2 },
      { mongooseConn, pubsub },
    );
    expect(updatedPlace2).toBeNull();
  });

  test('should create mutation update thing resolver to remove embedded fields on null', async () => {
    const embeddedConfig: ThingConfig = {
      name: 'Embedded',
      embedded: true,
      textFields: [
        {
          name: 'embeddedTextField',
        },
      ],
    };

    const exampleConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField1',
        },
        {
          name: 'textField2',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedField',
          config: embeddedConfig,
        },
      ],
    };

    const createExample = createCreateThingMutationResolver(
      exampleConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createExample).toBe('function');
    if (!createExample) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      textField1: 'text Field 1',
      textField2: 'text Field 2',
      embeddedField: {
        embeddedTextField: 'embedded Text Field',
      },
    };

    const createdExample = await createExample(null, { data }, { mongooseConn, pubsub });
    expect(createdExample.textField1).toBe(data.textField1);
    expect(createdExample.textField2).toBe(data.textField2);
    expect(createdExample.embeddedField).toEqual(data.embeddedField);
    expect(createdExample.createdAt instanceof Date).toBeTruthy();
    expect(createdExample.updatedAt instanceof Date).toBeTruthy();
    const { id } = createdExample;

    const exampleSchema = createThingSchema(exampleConfig);
    const Example = mongooseConn.model('ExampleThing', exampleSchema);

    const updateExample = createUpdateThingMutationResolver(
      exampleConfig,
      generalConfig,
      serversideConfig,
    );
    if (!updateExample) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const whereOne = { id };
    const dataForUpdate = {
      textField1: 'text Field 1 Plus',
      textField2: 'text Field 2 Plus',
      embeddedField: {
        embeddedTextField: 'embedded Text Field Plus',
      },
    };
    const updatedExample = await updateExample(
      null,
      { whereOne, data: dataForUpdate },
      { mongooseConn, pubsub },
    );
    expect(updatedExample.textField1).toBe(dataForUpdate.textField1);
    expect(updatedExample.textField2).toBe(dataForUpdate.textField2);
    expect(updatedExample.embeddedField).toEqual(dataForUpdate.embeddedField);

    const dataForUpdate2 = {
      textField1: 'text Field 1 Plus Plus',
      textField2: undefined,
      embeddedField: undefined,
    };

    const updatedExample2 = await updateExample(
      null,
      { whereOne, data: dataForUpdate2 },
      { mongooseConn, pubsub },
    );
    expect(updatedExample2.textField1).toBe(dataForUpdate2.textField1);
    expect(updatedExample2.textField2).toBe(dataForUpdate.textField2);
    expect(updatedExample2.embeddedField).toEqual(dataForUpdate.embeddedField);

    const dataForUpdate3 = {
      textField1: 'text Field 1 Plus Plus Plus',
      textField2: null,
    };

    const updatedExample3 = await updateExample(
      null,
      { whereOne, data: dataForUpdate3 },
      { mongooseConn, pubsub },
    );
    expect(updatedExample3.textField1).toBe(dataForUpdate3.textField1);
    expect(updatedExample3.textField2).toBe(dataForUpdate3.textField2);

    const updatedExample31 = await Example.findById(id);
    const updatedExample32 = updatedExample31.toObject();
    expect(updatedExample32.textField1).toBe(dataForUpdate3.textField1);
    expect(updatedExample32.textField2).toBe(dataForUpdate3.textField2);
  });

  test('should create mutation update thing resolver to update embedded array fiedl', async () => {
    const embeddedConfig: ThingConfig = {
      name: 'Embedded',
      embedded: true,
      textFields: [
        {
          name: 'embeddedTextField',
        },
      ],
    };

    const mainConfig: ThingConfig = {
      name: 'Main',
      textFields: [
        {
          name: 'textField',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedFields',
          config: embeddedConfig,
          array: true,
        },
      ],
    };

    const createMain = createCreateThingMutationResolver(
      mainConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createMain).toBe('function');
    if (!createMain) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      textField: 'text Field',
    };

    const createdMain = await createMain(null, { data }, { mongooseConn, pubsub });
    expect(createdMain.textField).toBe(data.textField);
    const { id } = createdMain;

    const updateMain = createUpdateThingMutationResolver(
      mainConfig,
      generalConfig,
      serversideConfig,
    );
    if (!updateMain) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const whereOne = { id };
    const dataForUpdate = {
      textField: 'text Field 2',
      embeddedFields: [
        {
          embeddedTextField: 'embedded Text Field 1',
        },
        {
          embeddedTextField: 'embedded Text Field 2',
        },
      ],
    };

    const updatedMain = await updateMain(
      null,
      { whereOne, data: dataForUpdate },
      { mongooseConn, pubsub },
    );

    expect(updatedMain.textField).toBe(dataForUpdate.textField);
    expect(updatedMain.embeddedFields.length).toBe(2);
    expect(updatedMain.embeddedFields[0].embeddedTextField).toBe(
      dataForUpdate.embeddedFields[0].embeddedTextField,
    );
    expect(updatedMain.embeddedFields[1].embeddedTextField).toBe(
      dataForUpdate.embeddedFields[1].embeddedTextField,
    );
  });
});
