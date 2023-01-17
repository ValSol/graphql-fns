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
const { default: createUpdateFilteredEntitiesReturnScalarMutationResolver } = require('./index');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-update-filtered-entities-return-scalar-mutation';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('createUpdateFilteredEntitiesReturnScalarMutationResolver', () => {
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

      const createdPerson = await createPerson(null, { data }, { mongooseConn, pubsub }, null, {
        inputEntity: [],
      });
      expect(createdPerson.firstName).toBe(data.firstName);
      expect(createdPerson.lastName).toBe(data.lastName);
      expect(createdPerson.createdAt instanceof Date).toBeTruthy();
      expect(createdPerson.updatedAt instanceof Date).toBeTruthy();
      expect(createdPerson.counter).toBe(1);

      const { id } = createdPerson;

      const updateFilteredPersons = createUpdateFilteredEntitiesReturnScalarMutationResolver(
        personConfig,
        generalConfig,
        serversideConfig,
      );
      if (!updateFilteredPersons) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

      const dataForUpdate = {
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
      };
      const where = { id_in: [id] };

      const updatedPersonCount = await updateFilteredPersons(
        null,
        { where, data: dataForUpdate },
        { mongooseConn, pubsub },
        null,
        { inputEntity: [] },
      );

      expect(updatedPersonCount).toBe(1);
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
      const createdPerson = await createPerson(null, { data }, { mongooseConn, pubsub }, null, {
        inputEntity: [],
      });
      expect(createdPerson.firstName).toBe(data.firstName);
      expect(createdPerson.lastName).toBe(data.lastName);
      expect(createdPerson.createdAt instanceof Date).toBeTruthy();
      expect(createdPerson.updatedAt instanceof Date).toBeTruthy();
      expect(createdPerson.counter).toBe(4);

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

      const createdPerson2 = await createPerson(
        null,
        { data: data2 },
        { mongooseConn, pubsub },
        null,
        { inputEntity: [] },
      );
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

      const updateFilteredPersons = createUpdateFilteredEntitiesReturnScalarMutationResolver(
        personConfig,
        generalConfig,
        serversideConfig,
      );
      if (!updateFilteredPersons) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

      const where = { id_in: [id] };
      const dataForUpdate = {
        firstName: 'Vasya',
        lastName: 'Pupkin',
        friend: { connect: createdFriend2._id },
        location: { connect: createdLocation2._id },
        locations: { connect: [createdLocations2[0]._id, createdLocations2[1]._id] },
        favorities: { connect: [createdFavorities2[0]._id, createdFavorities2[1]._id] },
      };
      const updatedPersonCount = await updateFilteredPersons(
        null,
        { where, data: dataForUpdate },
        { mongooseConn, pubsub },
        null,
        { inputEntity: [] },
      );
      expect(updatedPersonCount).toBe(1);

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

      const updateFilteredPlaces = createUpdateFilteredEntitiesReturnScalarMutationResolver(
        placeConfig,
        generalConfig,
        serversideConfig,
      );
      if (!updateFilteredPlaces) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

      const where2 = { name: data.location.create.name };
      const dataForUpdate2 = { name: 'Mexico' };
      const updatedPlaceCount = await updateFilteredPlaces(
        null,
        { where: where2, data: dataForUpdate2 },
        { mongooseConn, pubsub },
        null,
        { inputEntity: [] },
      );

      expect(updatedPlaceCount).toBe(1);

      const updatedPlacesCount = await updateFilteredPlaces(
        null,
        { where: where2, data: dataForUpdate2 },
        { mongooseConn, pubsub },
        null,
        { inputEntity: [] },
      );
      expect(updatedPlacesCount).toEqual(0);
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

    const createdExample = await createExample(null, { data }, { mongooseConn, pubsub }, null, {
      inputEntity: [],
    });
    expect(createdExample.textField1).toBe(data.textField1);
    expect(createdExample.textField2).toBe(data.textField2);
    expect(createdExample.embeddedField.embeddedTextField).toBe(
      data.embeddedField.embeddedTextField,
    );
    expect(createdExample.createdAt instanceof Date).toBeTruthy();
    expect(createdExample.updatedAt instanceof Date).toBeTruthy();
    const { id } = createdExample;

    const updateFilteredExamples = createUpdateFilteredEntitiesReturnScalarMutationResolver(
      exampleConfig,
      generalConfig,
      serversideConfig,
    );
    if (!updateFilteredExamples) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const where = { id_in: [id] };
    const dataForUpdate = {
      textField1: 'text Field 1 Plus',
      textField2: 'text Field 2 Plus',
      embeddedField: {
        embeddedTextField: 'embedded Text Field Plus',
      },
    };

    const updatedExampleCount = await updateFilteredExamples(
      null,
      { where, data: dataForUpdate },
      { mongooseConn, pubsub },
      null,
      { inputEntity: [] },
    );
    expect(updatedExampleCount).toBe(1);

    const dataForUpdate2 = {
      textField1: 'text Field 1 Plus Plus',
      textField2: undefined,
      embeddedField: undefined,
    };
    const updatedExampleCount2 = await updateFilteredExamples(
      null,
      { where, data: dataForUpdate2 },
      { mongooseConn, pubsub },
      null,
      { inputEntity: [] },
    );

    expect(updatedExampleCount2).toBe(1);

    const dataForUpdate3 = {
      textField1: 'text Field 1 Plus Plus Plus',
      textField2: null,
    };
    const updatedExampleCount3 = await updateFilteredExamples(
      null,
      { where, data: dataForUpdate3 },
      { mongooseConn, pubsub },
      null,
      { inputEntity: [] },
    );
    expect(updatedExampleCount3).toBe(1);
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

    const createdMain = await createMain(null, { data }, { mongooseConn, pubsub }, null, {
      inputEntity: [],
    });
    expect(createdMain.textField).toBe(data.textField);
    const { id } = createdMain;

    const updateMain = createUpdateFilteredEntitiesReturnScalarMutationResolver(
      mainConfig,
      generalConfig,
      serversideConfig,
    );
    if (!updateMain) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const where = { id_in: [id] };
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
    const updatedMainCount = await updateMain(
      null,
      { where, data: dataForUpdate },
      { mongooseConn, pubsub },
      null,
      { inputEntity: [] },
    );

    expect(updatedMainCount).toBe(1);
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

    const createdMain = await createMain(null, { data }, { mongooseConn, pubsub }, null, {
      inputEntity: [],
    });
    expect(createdMain.textField).toBe(data.textField);
    const { id } = createdMain;

    const updateMain = createUpdateFilteredEntitiesReturnScalarMutationResolver(
      mainConfig,
      generalConfig,
      serversideConfig,
    );
    if (!updateMain) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const where = { id_in: [id] };
    const dataForUpdate = {
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
    };
    const updatedMainCount = await updateMain(
      null,
      { where, data: dataForUpdate },
      { mongooseConn, pubsub },
      null,
      { inputEntity: [] },
    );

    expect(updatedMainCount).toBe(1);
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
      await createParent(null, { data }, { mongooseConn, pubsub }, null, { inputEntity: [] });
    }

    const updateFilteredPersons = createUpdateFilteredEntitiesReturnScalarMutationResolver(
      parentConfig,
      generalConfig,
      serversideConfig,
    );
    if (!updateFilteredPersons) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const where = {
      AND: [
        { name: 'name-2' },
        { child_: { textFields_in: ['text-2', 'text-4', 'text-12', 'text-99'] } },
      ],
    };

    const info = { projection: { _id: 1, name: 1 } };
    const data = { name: 'updatedName' };
    const updatedParentCount = await updateFilteredPersons(
      null,
      { data, where },
      { mongooseConn, pubsub },
      info,
      { inputEntity: [] },
    );

    expect(updatedParentCount).toBe(1);

    const where2 = {
      AND: [
        { name: 'name-1' },
        { child_: { textFields_in: ['text-2', 'text-4', 'text-12', 'text-99'] } },
      ],
    };
    const updatedParentsCount = await updateFilteredPersons(
      null,
      { data, where: where2 },
      { mongooseConn, pubsub },
      info,
      { inputEntity: [] },
    );

    expect(updatedParentsCount).toEqual(0);
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

    const { id: restaurantId } = await createRestaurant(
      null,
      { data },
      { mongooseConn, pubsub },
      null,
      { inputEntity: [] },
    );

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

    const post = await createPost(null, { data: postData }, { mongooseConn, pubsub }, null, {
      inputEntity: [{ restaurant_: { access_: { postCreators: '1234567890' } } }],
    });

    expect(post.restaurant.toString()).toEqual(restaurantId.toString());
    expect(post.slug).toBe(postData.slug);

    const updateFilteredPosts = createUpdateFilteredEntitiesReturnScalarMutationResolver(
      postConfig,
      generalConfig2,
      serversideConfig,
      true,
    );

    expect(typeof updateFilteredPosts).toBe('function');
    if (!updateFilteredPosts) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const where = { id_in: [post.id.toString()] };

    const dataToUpdate = {
      restaurant: { connect: '6073f383f1b1bcd591983c92' },
    };
    const updatedPostsCount = await updateFilteredPosts(
      null,
      { where, data: dataToUpdate },
      { mongooseConn, pubsub },
      null,
      { inputEntity: [{ restaurant_: { access_: { postCreators: '1234567890' } } }] },
    );

    expect(updatedPostsCount).toEqual(0);

    const dataToUpdate2 = {
      restaurant: { connect: restaurantId },
      slug: 'updatedSlug',
    };

    const updatedPostCount2 = await updateFilteredPosts(
      null,
      { where, data: dataToUpdate2 },
      { mongooseConn, pubsub },
      null,
      { inputEntity: [{ restaurant_: { access_: { postCreators: '1234567890' } } }] },
    );

    expect(updatedPostCount2).toBe(1);

    const dataToUpdate3 = {
      type: 'toProfessionals',
    };
    const updatedPostsCount2 = await updateFilteredPosts(
      null,
      { where, data: dataToUpdate3 },
      { mongooseConn, pubsub },
      null,
      {
        inputEntity: [
          {
            restaurant_: { access_: { postCreators: '1234567890' } },
            type_in: ['newsFeed', 'events'],
          },
        ],
      },
    );

    expect(updatedPostsCount2).toEqual(0);

    const dataToUpdate4 = {
      type: 'toProfessionals 2',
    };
    const updatedPostsCount3 = await updateFilteredPosts(
      null,
      { where: { slug: 'name is absent' }, data: dataToUpdate4 },
      { mongooseConn, pubsub },
      null,
      { inputEntity: [] },
    );

    expect(updatedPostsCount3).toEqual(0);
  });
});
