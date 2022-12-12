// @flow
/* eslint-env jest */
/* eslint no-underscore-dangle: 0 */
import type { GeneralConfig, EntityConfig } from '../../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../../test/mongo-options');
const { default: createThingSchema } = require('../../../mongooseModels/createThingSchema');
const {
  default: createCreateEntityMutationResolver,
} = require('../createCreateEntityMutationResolver');
const { default: createUpdateManyEntitiesMutationResolver } = require('./index');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-update-many-entities-mutation';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('createUpdateManyEntitiesMutationResolver', () => {
  const generalConfig: GeneralConfig = { allEntityConfigs: {} };
  const serversideConfig = { transactions: true };
  describe('for entities that have duplex fields', () => {
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
      counter: true,
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
          name: 'sibling',
          config: personConfig,
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

    test('should create mutation update entity resolver that create childrent entities', async () => {
      const personSchema = createThingSchema(personConfig);
      const Person = mongooseConn.model('Person_Thing', personSchema);
      await Person.createCollection();

      const placeSchema = createThingSchema(placeConfig);
      const Place = mongooseConn.model('Place_Thing', placeSchema);
      await Place.createCollection();

      const createPerson = createCreateEntityMutationResolver(
        personConfig,
        generalConfig,
        serversideConfig,
      );
      expect(typeof createPerson).toBe('function');
      if (!createPerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error
      const data = {
        firstName: 'Hugo 2',
        lastName: 'Boss 2',
        friend: { create: null },
        location: { create: null },
        locations: { create: [] },
        favorities: { create: [] },
      };

      const createdPerson = await createPerson(null, { data }, { mongooseConn, pubsub });
      expect(createdPerson.firstName).toBe(data.firstName);
      expect(createdPerson.lastName).toBe(data.lastName);
      expect(createdPerson.createdAt instanceof Date).toBeTruthy();
      expect(createdPerson.updatedAt instanceof Date).toBeTruthy();
      expect(createdPerson.counter).toBe(1);

      const { id } = createdPerson;

      const updateManyPersons = createUpdateManyEntitiesMutationResolver(
        personConfig,
        generalConfig,
        serversideConfig,
      );
      if (!updateManyPersons) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

      const dataForUpdate = [
        {
          sibling: {
            create: { firstName: 'Vasya', lastName: 'Pupkin', locations: [], favorities: [] },
          },
          firstName: 'Mark 2',
          lastName: 'Tven 2',
          friend: {
            create: {
              firstName: 'Karl 2',
              lastName: 'Marx 2',
              location: {
                create: {
                  name: 'German 2',
                },
              },
            },
          },
          location: {
            create: {
              name: 'Canada 2',
            },
          },
          locations: {
            create: [
              {
                name: 'Nigeria',
              },
              {
                name: 'Ethiopia',
              },
              {
                name: 'Egypt',
              },
              {
                name: 'Congo',
              },
            ],
          },
          favorities: {
            create: [
              {
                name: 'Tanzania',
              },
              {
                name: 'South Africa',
              },
              {
                name: 'Kenya',
              },
              {
                name: 'Uganda',
              },
            ],
          },
        },
      ];

      const whereOne = [{ id }];

      const [updatedPerson] = await updateManyPersons(
        null,
        { whereOne, data: dataForUpdate },
        { mongooseConn, pubsub },
      );

      expect(Boolean(updatedPerson.sibling)).toBe(true);
      expect(Boolean(updatedPerson.friend)).toBe(true);
      expect(updatedPerson.firstName).toBe(dataForUpdate[0].firstName);
      expect(updatedPerson.lastName).toBe(dataForUpdate[0].lastName);
      expect(updatedPerson.locations.length).toBe(4);
      expect(updatedPerson.favorities.length).toBe(4);
      expect(updatedPerson.counter).toBe(1);

      const siblingId = updatedPerson.sibling;

      const createdSibling = await Person.findById(siblingId);

      expect(createdSibling.firstName).toBe(dataForUpdate[0].sibling.create.firstName);
      expect(createdSibling.lastName).toBe(dataForUpdate[0].sibling.create.lastName);
      expect(createdSibling.counter).toBe(2);

      const friendId = updatedPerson.friend;

      const createdFriend = await Person.findById(friendId);

      expect(createdFriend.firstName).toBe(dataForUpdate[0].friend.create.firstName);
      expect(createdFriend.lastName).toBe(dataForUpdate[0].friend.create.lastName);
      expect(createdFriend.friend).toEqual(id);
      expect(createdFriend.counter).toBe(3);

      const dataForUpdate2 = [
        {
          locations: {
            connect: [...updatedPerson.locations],
            create: [
              {
                name: 'Algeria',
              },
              {
                name: 'Somalia',
              },
              {
                name: 'Morocco',
              },
            ],
            createPositions: [0, 1, 2],
          },
          favorities: {
            create: [
              {
                name: 'Mozambique',
              },
              {
                name: 'Ghana',
              },
              {
                name: 'Angola',
              },
            ],
            createPositions: [2, 3, 4],
            connect: [...updatedPerson.favorities],
          },
        },
      ];

      // const positions = { locations: [0, 1, 2], favorities: [2, 3, 4] };

      const [updatedPerson2] = await updateManyPersons(
        null,
        { whereOne, data: dataForUpdate2 },
        { mongooseConn, pubsub },
      );

      const createdFriend2 = await Person.findById(friendId);

      expect(createdFriend2.firstName).toBe(dataForUpdate[0].friend.create.firstName);
      expect(createdFriend2.lastName).toBe(dataForUpdate[0].friend.create.lastName);
      expect(createdFriend2.friend).toEqual(id);

      expect(Boolean(updatedPerson.sibling)).toBe(true);
      expect(Boolean(updatedPerson.friend)).toBe(true);
      expect(updatedPerson2.firstName).toBe(dataForUpdate[0].firstName);
      expect(updatedPerson2.lastName).toBe(dataForUpdate[0].lastName);
      expect(updatedPerson2.locations.length).toBe(7);
      expect(updatedPerson2.locations.slice(3)).toEqual(updatedPerson.locations);
      expect(updatedPerson2.favorities.length).toBe(7);
      expect(updatedPerson2.favorities.slice(0, 2)).toEqual(updatedPerson.favorities.slice(0, 2));
      expect(updatedPerson2.favorities.slice(5)).toEqual(updatedPerson.favorities.slice(2));

      const dataForUpdate3 = [
        {
          sibling: {
            connect: null,
          },
          friend: {
            create: {
              firstName: 'Karl 3',
              lastName: 'Marx 3',
              location: {
                create: {
                  name: 'German 3',
                },
              },
            },
          },
        },
      ];

      const [updatedPerson3] = await updateManyPersons(
        null,
        { whereOne, data: dataForUpdate3 },
        { mongooseConn, pubsub },
      );

      const createdFriend3 = await Person.findById(friendId);

      expect(createdFriend3.firstName).toBe(dataForUpdate[0].friend.create.firstName);
      expect(createdFriend3.lastName).toBe(dataForUpdate[0].friend.create.lastName);
      expect(createdFriend3.friend).toEqual(undefined);

      expect(updatedPerson3.sibling).toBe(undefined);
      expect(Boolean(updatedPerson3.friend)).toBe(true);
      expect(updatedPerson3.firstName).toBe(dataForUpdate[0].firstName);
      expect(updatedPerson3.lastName).toBe(dataForUpdate[0].lastName);
      expect(updatedPerson3.locations.length).toBe(7);
      expect(updatedPerson3.locations.slice(3)).toEqual(updatedPerson.locations);
      expect(updatedPerson3.favorities.length).toBe(7);
      expect(updatedPerson3.favorities.slice(0, 2)).toEqual(updatedPerson.favorities.slice(0, 2));
      expect(updatedPerson3.favorities.slice(5)).toEqual(updatedPerson.favorities.slice(2));

      const friendId2 = updatedPerson3.friend;

      const dataForUpdate4 = [
        {
          friend: {
            connect: null,
          },
        },
      ];

      const [updatedPerson4] = await updateManyPersons(
        null,
        { whereOne, data: dataForUpdate4 },
        { mongooseConn, pubsub },
      );

      const createdFriend4 = await Person.findById(friendId2);

      expect(createdFriend4.firstName).toBe(dataForUpdate3[0].friend.create.firstName);
      expect(createdFriend4.lastName).toBe(dataForUpdate3[0].friend.create.lastName);
      expect(createdFriend4.friend).toEqual(undefined);

      expect(updatedPerson4.sibling).toBe(undefined);
      expect(updatedPerson4.friend).toBe(undefined);
      expect(updatedPerson4.firstName).toBe(dataForUpdate[0].firstName);
      expect(updatedPerson4.lastName).toBe(dataForUpdate[0].lastName);
      expect(updatedPerson4.locations.length).toBe(7);
      expect(updatedPerson4.locations.slice(3)).toEqual(updatedPerson.locations);
      expect(updatedPerson4.favorities.length).toBe(7);
      expect(updatedPerson4.favorities.slice(0, 2)).toEqual(updatedPerson.favorities.slice(0, 2));
      expect(updatedPerson4.favorities.slice(5)).toEqual(updatedPerson.favorities.slice(2));
    });

    test('should create mutation update entity resolver with wipe out duplex fields values', async () => {
      const personSchema = createThingSchema(personConfig);
      const Person = mongooseConn.model('Person_Thing', personSchema);
      await Person.createCollection();

      const placeSchema = createThingSchema(placeConfig);
      const Place = mongooseConn.model('Place_Thing', placeSchema);
      await Place.createCollection();

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
      const createdPerson = await createPerson(null, { data }, { mongooseConn, pubsub });
      expect(createdPerson.firstName).toBe(data.firstName);
      expect(createdPerson.lastName).toBe(data.lastName);
      expect(createdPerson.createdAt instanceof Date).toBeTruthy();
      expect(createdPerson.updatedAt instanceof Date).toBeTruthy();
      expect(createdPerson.counter).toBe(5);

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

      const updateManyPersons = createUpdateManyEntitiesMutationResolver(
        personConfig,
        generalConfig,
        serversideConfig,
      );
      if (!updateManyPersons) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

      const whereOne = [{ id }];
      const dataForUpdate = [
        {
          firstName: 'Vasya',
          lastName: 'Pupkin',
          friend: { connect: createdFriend2._id },
          location: { connect: createdLocation2._id },
          locations: { connect: [createdLocations2[0]._id, createdLocations2[1]._id] },
          favorities: { connect: [createdFavorities2[0]._id, createdFavorities2[1]._id] },
        },
      ];
      const [updatedPerson] = await updateManyPersons(
        null,
        { whereOne, data: dataForUpdate },
        { mongooseConn, pubsub },
      );
      expect(updatedPerson.firstName).toBe(dataForUpdate[0].firstName);
      expect(updatedPerson.lastName).toBe(dataForUpdate[0].lastName);
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

      const updateManyPlaces = createUpdateManyEntitiesMutationResolver(
        placeConfig,
        generalConfig,
        serversideConfig,
      );
      if (!updateManyPlaces) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

      const whereOne2 = [{ name: data.location.create.name }];

      const dataForUpdate2 = [{ name: 'Mexico' }];
      const [updatedPlace] = await updateManyPlaces(
        null,
        { whereOne: whereOne2, data: dataForUpdate2 },
        { mongooseConn, pubsub },
      );

      expect(updatedPlace.name).toBe(dataForUpdate2[0].name);

      const updatedPlaces = await updateManyPlaces(
        null,
        { whereOne: whereOne2, data: dataForUpdate2 },
        { mongooseConn, pubsub },
      );
      expect(updatedPlaces).toBeNull();
    });
  });

  test('should create mutation update entity resolver to remove embedded fields on null', async () => {
    const embeddedConfig: EntityConfig = {
      name: 'Embedded',
      type: 'embedded',
      textFields: [
        {
          name: 'embeddedTextField',
        },
      ],
    };

    const exampleConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
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

    const exampleSchema = createThingSchema(exampleConfig);
    const Example = mongooseConn.model('Example_Thing', exampleSchema);
    await Example.createCollection();

    const createExample = createCreateEntityMutationResolver(
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
    expect(createdExample.embeddedField.embeddedTextField).toBe(
      data.embeddedField.embeddedTextField,
    );
    expect(createdExample.createdAt instanceof Date).toBeTruthy();
    expect(createdExample.updatedAt instanceof Date).toBeTruthy();
    const { id } = createdExample;

    const updateManyExamples = createUpdateManyEntitiesMutationResolver(
      exampleConfig,
      generalConfig,
      serversideConfig,
    );
    if (!updateManyExamples) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const whereOne = [{ id }];
    const dataForUpdate = [
      {
        textField1: 'text Field 1 Plus',
        textField2: 'text Field 2 Plus',
        embeddedField: {
          embeddedTextField: 'embedded Text Field Plus',
        },
      },
    ];
    const [updatedExample] = await updateManyExamples(
      null,
      { whereOne, data: dataForUpdate },
      { mongooseConn, pubsub },
    );
    expect(updatedExample.textField1).toBe(dataForUpdate[0].textField1);
    expect(updatedExample.textField2).toBe(dataForUpdate[0].textField2);
    expect(updatedExample.embeddedField.embeddedTextField).toBe(
      dataForUpdate[0].embeddedField.embeddedTextField,
    );

    const dataForUpdate2 = [
      {
        textField1: 'text Field 1 Plus Plus',
        textField2: undefined,
        embeddedField: undefined,
      },
    ];

    const [updatedExample2] = await updateManyExamples(
      null,
      { whereOne, data: dataForUpdate2 },
      { mongooseConn, pubsub },
    );

    expect(updatedExample2.textField1).toBe(dataForUpdate2[0].textField1);
    expect(updatedExample2.textField2).toBe(dataForUpdate[0].textField2);
    expect(updatedExample2.embeddedField.embeddedTextField).toEqual(
      dataForUpdate[0].embeddedField.embeddedTextField,
    );

    const dataForUpdate3 = [
      {
        textField1: 'text Field 1 Plus Plus Plus',
        textField2: null,
      },
    ];

    const [updatedExample3] = await updateManyExamples(
      null,
      { whereOne, data: dataForUpdate3 },
      { mongooseConn, pubsub },
    );
    expect(updatedExample3.textField1).toBe(dataForUpdate3[0].textField1);
    expect(updatedExample3.textField2).toBe(undefined);

    const updatedExample31 = await Example.findById(id);
    const updatedExample32 = updatedExample31.toObject();
    expect(updatedExample32.textField1).toBe(dataForUpdate3[0].textField1);
    expect(updatedExample32.textField2).toBe(undefined);
  });

  test('should create mutation update entity resolver to update embedded array field', async () => {
    const embeddedConfig: EntityConfig = {
      name: 'Embedded',
      type: 'embedded',
      textFields: [
        {
          name: 'embeddedTextField',
        },
      ],
    };

    const mainConfig: EntityConfig = {
      name: 'Main',
      type: 'tangible',
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

    const mainSchema = createThingSchema(mainConfig);
    const Main = mongooseConn.model('Main_Thing', mainSchema);
    await Main.createCollection();

    const createMain = createCreateEntityMutationResolver(
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

    const updateMain = createUpdateManyEntitiesMutationResolver(
      mainConfig,
      generalConfig,
      serversideConfig,
    );
    if (!updateMain) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const whereOne = [{ id }];
    const dataForUpdate = [
      {
        textField: 'text Field 2',
        embeddedFields: [
          {
            embeddedTextField: 'embedded Text Field 1',
          },
          {
            embeddedTextField: 'embedded Text Field 2',
          },
        ],
      },
    ];

    const [updatedMain] = await updateMain(
      null,
      { whereOne, data: dataForUpdate },
      { mongooseConn, pubsub },
    );

    expect(updatedMain.textField).toBe(dataForUpdate[0].textField);
    expect(updatedMain.embeddedFields.length).toBe(2);
    expect(updatedMain.embeddedFields[0].embeddedTextField).toBe(
      dataForUpdate[0].embeddedFields[0].embeddedTextField,
    );
    expect(updatedMain.embeddedFields[1].embeddedTextField).toBe(
      dataForUpdate[0].embeddedFields[1].embeddedTextField,
    );
  });

  test('should create mutation update entity resolver to update file array field', async () => {
    const imageConfig: EntityConfig = {
      name: 'Image',
      type: 'file',
      textFields: [
        {
          name: 'fileId',
        },
        {
          name: 'address',
        },
      ],
    };

    const mainConfig: EntityConfig = {
      name: 'Main2',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
        },
        {
          name: 'pictures',
          config: imageConfig,
          array: true,
        },
      ],
    };

    const mainSchema = createThingSchema(mainConfig);
    const Main = mongooseConn.model('Main2_Thing', mainSchema);
    await Main.createCollection();

    const createMain = createCreateEntityMutationResolver(
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

    const updateMain = createUpdateManyEntitiesMutationResolver(
      mainConfig,
      generalConfig,
      serversideConfig,
    );
    if (!updateMain) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const whereOne = [{ id }];
    const dataForUpdate = [
      {
        textField: 'text Field',
        logo: {
          fileId: '123',
          address: '/images/logo',
        },
        pictures: [
          {
            fileId: '456',
            address: '/images/pic1',
          },
          {
            fileId: '789',
            address: '/images/pic2',
          },
        ],
      },
    ];

    const [updatedMain] = await updateMain(
      null,
      { whereOne, data: dataForUpdate },
      { mongooseConn, pubsub },
    );

    expect(updatedMain.textField).toBe(dataForUpdate[0].textField);
    expect(updatedMain.pictures.length).toBe(2);
    expect(updatedMain.pictures[0].fileId).toBe(dataForUpdate[0].pictures[0].fileId);
    expect(updatedMain.pictures[0].address).toBe(dataForUpdate[0].pictures[0].address);
    expect(updatedMain.pictures[1].fileId).toBe(dataForUpdate[0].pictures[1].fileId);
    expect(updatedMain.pictures[1].address).toBe(dataForUpdate[0].pictures[1].address);
  });

  test('should create mutation updateEntity resolver to aggregate result', async () => {
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
      await createParent(null, { data }, { mongooseConn, pubsub });
    }

    const updateManyPersons = createUpdateManyEntitiesMutationResolver(
      parentConfig,
      generalConfig,
      serversideConfig,
    );
    if (!updateManyPersons) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const whereOne = [{ name: 'name-2' }];

    const info = { projection: { _id: 1, name: 1 } };
    const data = [{ name: 'updatedName' }];
    const [updatedParent] = await updateManyPersons(
      null,
      { data, whereOne },
      { mongooseConn, pubsub },
      info,
    );

    expect(updatedParent.name).toBe('updatedName');

    const whereOne2 = [{ name: 'name-1' }];

    const updatedParents = await updateManyPersons(
      null,
      { data, whereOne: whereOne2 },
      { mongooseConn, pubsub },
      info,
      [{ child_: { textFields_in: ['text-2', 'text-4', 'text-12', 'text-99'] } }],
    );

    expect(updatedParents[0].name).toBe(data[0].name);
  });

  test('should create mutation updateEntity resolver to update document using checkData', async () => {
    const accessConfig: EntityConfig = {
      name: 'Access',
      type: 'tangible',

      textFields: [
        { name: 'postCreators', array: true, index: true },
        { name: 'postEditors', array: true, index: true },
        { name: 'postPublishers', array: true, index: true },
        { name: 'postTogglers', array: true, index: true },
        { name: 'restaurantCreators', array: true, index: true },
        { name: 'restaurantEditors', array: true, index: true },
        { name: 'restaurantPublishers', array: true, index: true },
        { name: 'restaurantTogglers', array: true, index: true },
      ],
    };

    const postConfig: EntityConfig = {};
    const restaurantConfig: EntityConfig = {};

    Object.assign(postConfig, {
      name: 'Post',
      type: 'tangible',

      textFields: [{ name: 'slug' }, { name: 'type' }],

      relationalFields: [
        {
          name: 'restaurant',
          config: restaurantConfig,
          index: true,
        },
        {
          name: 'restaurants',
          config: restaurantConfig,
          array: true,
          index: true,
        },
      ],
    });

    Object.assign(restaurantConfig, {
      name: 'Restaurant',
      type: 'tangible',

      textFields: [{ name: 'slug' }],

      relationalFields: [
        {
          name: 'access',
          config: accessConfig,
          index: true,
        },
      ],
    });

    const accessSchema = createThingSchema(accessConfig);
    const Access = mongooseConn.model('Access_Thing', accessSchema);
    await Access.createCollection();

    const postSchema = createThingSchema(postConfig);
    const Post = mongooseConn.model('Post_Thing', postSchema);
    await Post.createCollection();

    const restaurantSchema = createThingSchema(restaurantConfig);
    const Restaurant = mongooseConn.model('Restaurant_Thing', restaurantSchema);
    await Restaurant.createCollection();

    const generalConfig2: GeneralConfig = {
      allEntityConfigs: { Access: accessConfig, Post: postConfig, Restaurant: restaurantConfig },
    };

    const createRestaurant = createCreateEntityMutationResolver(
      restaurantConfig,
      generalConfig2,
      serversideConfig,
    );

    expect(typeof createRestaurant).toBe('function');
    if (!createRestaurant) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      slug: 'Pantagruel',
      access: {
        create: {
          postCreators: ['1234567890'],
        },
      },
    };

    const { id: restaurantId } = await createRestaurant(null, { data }, { mongooseConn, pubsub });

    const createPost = createCreateEntityMutationResolver(
      postConfig,
      generalConfig2,
      serversideConfig,
      true,
    );

    expect(typeof createPost).toBe('function');
    if (!createPost) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const postData = {
      slug: 'news',
      type: 'newsFeed',
      restaurant: { connect: restaurantId },
    };

    const post = await createPost(null, { data: postData }, { mongooseConn, pubsub }, null, [
      { restaurant_: { access_: { postCreators: '1234567890' } } },
    ]);

    expect(post.restaurant.toString()).toEqual(restaurantId.toString());
    expect(post.slug).toBe(postData.slug);

    const updateManyPosts = createUpdateManyEntitiesMutationResolver(
      postConfig,
      generalConfig2,
      serversideConfig,
      true,
    );

    expect(typeof updateManyPosts).toBe('function');
    if (!updateManyPosts) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const whereOne = [{ id: post.id.toString() }];

    const dataToUpdate = [
      {
        restaurant: { connect: '6073f383f1b1bcd591983c92' },
      },
    ];

    const updatedPosts = await updateManyPosts(
      null,
      { whereOne, data: dataToUpdate },
      { mongooseConn, pubsub },
      null,
      [{ restaurant_: { access_: { postCreators: '1234567890' } } }],
    );

    expect(updatedPosts).toBe(null);

    const dataToUpdate2 = [
      {
        restaurant: { connect: restaurantId },
        slug: 'updatedSlug',
      },
    ];

    const [updatedPost2] = await updateManyPosts(
      null,
      { whereOne, data: dataToUpdate2 },
      { mongooseConn, pubsub },
      null,
      [{ restaurant_: { access_: { postCreators: '1234567890' } } }],
    );

    expect(updatedPost2.slug).toBe(dataToUpdate2[0].slug);

    const emptyUpdatedPosts = await updateManyPosts(
      null,
      { whereOne: [], data: [] },
      { mongooseConn, pubsub },
      null,
      [],
    );

    expect(emptyUpdatedPosts).toEqual([]);

    const dataToUpdate3 = [
      {
        type: 'toProfessionals',
      },
    ];

    const updatedPosts2 = await updateManyPosts(
      null,
      { whereOne, data: dataToUpdate3 },
      { mongooseConn, pubsub },
      null,
      [
        {
          restaurant_: { access_: { postCreators: '1234567890' } },
          type_in: ['newsFeed', 'events'],
        },
      ],
    );

    expect(updatedPosts2).toBe(null);
  });
});
