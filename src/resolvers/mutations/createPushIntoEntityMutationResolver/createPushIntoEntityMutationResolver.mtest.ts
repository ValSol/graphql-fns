/* eslint-env jest */

import mongoose from 'mongoose';

import type { GeneralConfig, TangibleEntityConfig } from '../../../tsTypes';

import mongoOptions from '../../../test/mongo-options';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import pubsub from '../../utils/pubsub';
import createCreateEntityMutationResolver from '../createCreateEntityMutationResolver';
import createPushIntoEntityMutationResolver from './index';
import createInfoEssence from '@/resolvers/utils/createInfoEssence';

mongoose.set('strictQuery', false);

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-push-entity-mutation';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

describe('createPushIntoEntityMutationResolver', () => {
  const serversideConfig = { transactions: true };

  test('should create mutation pushInto entity resolver with wipe out duplex fields values', async () => {
    const personConfig = {} as TangibleEntityConfig;
    const placeConfig: TangibleEntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name', unique: true, type: 'textFields' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          config: personConfig,
          type: 'duplexFields',
        },
        {
          name: 'visitors',
          oppositeName: 'favorities',
          array: true,
          config: personConfig,
          type: 'duplexFields',
        },
        {
          name: 'curator',
          oppositeName: 'locations',
          config: personConfig,
          type: 'duplexFields',
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
          type: 'textFields',
        },
        {
          name: 'lastName',
          required: true,
          type: 'textFields',
        },
      ],
      duplexFields: [
        {
          name: 'friend',
          oppositeName: 'friend',
          config: personConfig,
          required: true,
          type: 'duplexFields',
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
          type: 'duplexFields',
        },
        {
          name: 'locations',
          oppositeName: 'curator',
          config: placeConfig,
          array: true,
          type: 'duplexFields',
        },
        {
          name: 'favorities',
          oppositeName: 'visitors',
          config: placeConfig,
          array: true,
          type: 'duplexFields',
        },
      ],
    });

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Person: personConfig, Place: placeConfig },
    };

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
      inputOutputEntity: [[]],
    });

    expect(createdPerson.firstName).toBe(data.firstName);
    expect(createdPerson.lastName).toBe(data.lastName);
    expect(createdPerson.createdAt instanceof Date).toBeTruthy();
    expect(createdPerson.updatedAt instanceof Date).toBeTruthy();
    expect(createdPerson.counter).toBe(1);

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
    expect(createdFriend.counter).toBe(2);

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
      { inputOutputEntity: [[]] },
    );
    expect(createdPerson2.firstName).toBe(data2.firstName);
    expect(createdPerson2.lastName).toBe(data2.lastName);
    expect(createdPerson2.createdAt instanceof Date).toBeTruthy();
    expect(createdPerson2.updatedAt instanceof Date).toBeTruthy();
    expect(createdPerson2.counter).toBe(3);

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
    expect(createdFriend2.counter).toBe(4);

    const createdFriendLocation2 = await Place.findById(createdFriend2.location);
    expect(createdFriendLocation2.name).toBe(data2.friend.create.location.create.name);

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

    const locationsCount = await Place.countDocuments();

    expect(locationsCount).toEqual(12);

    const pushIntoPerson = createPushIntoEntityMutationResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    if (!pushIntoPerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const whereOne = { id };
    const dataForUpdate = {
      locations: {
        connect: [createdLocations2[0]._id, createdLocations2[1]._id],
        create: [
          {
            name: 'India',
          },
          {
            name: 'Taiwan',
          },
          {
            name: 'Vietnam',
          },
        ],
      },
      favorities: {
        connect: [createdFavorities2[0]._id, createdFavorities2[1]._id],
        create: [
          {
            name: 'New Zealand',
          },
        ],
      },
    };

    const updatedPerson = await pushIntoPerson(
      null,
      { whereOne, data: dataForUpdate },
      { mongooseConn, pubsub },
      null,
      { inputOutputEntity: [[]] },
    );

    const { id: id3, locations: locations3, favorities: favorities3 } = updatedPerson;

    expect(locations3.length).toBe(7);
    expect(favorities3.length).toBe(5);

    expect(id).toEqual(id3);

    const locationsCount2 = await Place.countDocuments();

    expect(locationsCount2).toBe(locationsCount + 4);
  });

  test('should create mutation updateEntity resolver to aggregate result', async () => {
    const parentConfig = {} as TangibleEntityConfig;

    const childConfig: TangibleEntityConfig = {
      name: 'Child',
      type: 'tangible',
      textFields: [
        {
          name: 'textFields',
          array: true,
          index: true,
          type: 'textFields',
        },
        {
          name: 'textField',
          index: true,
          type: 'textFields',
        },
      ],

      relationalFields: [
        {
          name: 'parentChild',
          oppositeName: 'child',
          array: true,
          parent: true,
          config: parentConfig,
          type: 'relationalFields',
        },
        {
          name: 'parentChilds',
          oppositeName: 'childs',
          array: true,
          parent: true,
          config: parentConfig,
          type: 'relationalFields',
        },
      ],
    };

    Object.assign(parentConfig, {
      name: 'Parent',
      type: 'tangible',
      textFields: [
        {
          name: 'name',
          index: true,
          weight: 1,
          type: 'textFields',
        },
        {
          name: 'places',
          index: true,
          array: true,
          type: 'textFields',
        },
      ],

      relationalFields: [
        {
          name: 'child',
          oppositeName: 'parentChild',
          index: true,
          config: childConfig,
          type: 'relationalFields',
        },
        {
          name: 'childs',
          oppositeName: 'parentChilds',
          array: true,
          index: true,
          config: childConfig,
          type: 'relationalFields',
        },
      ],
    });

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Parent: parentConfig, Child: childConfig },
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
        places: [`place-${i}`],
        child: {
          create: {
            textFields: [`text-${i}`],
            textField: i < 15 ? 'first' : 'second',
          },
        },
      };

      await createParent(null, { data }, { mongooseConn, pubsub }, null, {
        inputOutputEntity: [[]],
      });
    }

    const pushIntoPerson = createPushIntoEntityMutationResolver(
      parentConfig,
      generalConfig,
      serversideConfig,
    );
    if (!pushIntoPerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const whereOne = {
      AND: [
        { name: 'name-2' },
        { child_: { textFields_in: ['text-2', 'text-4', 'text-12', 'text-99'] } },
      ],
    };

    const info = createInfoEssence({ _id: 1, name: 1, places: 1, child: 1, childs: 1 });

    const data = {
      places: ['newPlace-1', 'newPlace-2'],
      childs: {
        create: [{ textFields: ['textFields-pushed-1'], textField: 'textField-pushed-1' }],
      },
    };
    const updatedParent = await pushIntoPerson(
      null,
      { data, whereOne },
      { mongooseConn, pubsub },
      info,
      { inputOutputEntity: [[]] },
    );

    expect(updatedParent.places).toEqual(['place-2', 'newPlace-1', 'newPlace-2']);

    const whereOne2 = {
      AND: [
        { name: 'name-1' },
        { child_: { textFields_in: ['text-2', 'text-4', 'text-12', 'text-99'] } },
      ],
    };

    const updatedParent2 = await pushIntoPerson(
      null,
      { data, whereOne: whereOne2 },
      { mongooseConn, pubsub },
      info,
      { inputOutputEntity: [[]] },
    );

    expect(updatedParent2).toBe(null);
  });

  test('should create mutation updateEntity resolver to aggregate result', async () => {
    const parentConfig = {} as TangibleEntityConfig;

    const childConfig: TangibleEntityConfig = {
      name: 'Child2',
      type: 'tangible',
      textFields: [
        {
          name: 'textFields',
          array: true,
          index: true,
          type: 'textFields',
        },
        {
          name: 'textField',
          index: true,
          type: 'textFields',
        },
      ],

      relationalFields: [
        {
          name: 'parentChilds',
          oppositeName: 'childs',
          array: true,
          parent: true,
          config: parentConfig,
          type: 'relationalFields',
        },
      ],
    };

    Object.assign(parentConfig, {
      name: 'Parent2',
      type: 'tangible',
      textFields: [
        {
          name: 'name',
          index: true,
          weight: 1,
          type: 'textFields',
        },
        {
          name: 'places',
          index: true,
          array: true,
          type: 'textFields',
        },
      ],

      relationalFields: [
        {
          name: 'childs',
          oppositeName: 'parentChilds',
          array: true,
          index: true,
          config: childConfig,
          type: 'relationalFields',
        },
      ],
    });

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Parent2: parentConfig, Child2: childConfig },
    };

    const parentSchema = createThingSchema(parentConfig);
    const Parent = mongooseConn.model('Parent2_Thing', parentSchema);
    await Parent.createCollection();

    const childSchema = createThingSchema(childConfig);
    const Child = mongooseConn.model('Child2_Thing', childSchema);
    await Child.createCollection();

    const createParent = createCreateEntityMutationResolver(
      parentConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createParent).toBe('function');
    if (!createParent) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    await createParent(null, { data: { name: 'ParentName' } }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[]],
    });

    const pushIntoPerson = createPushIntoEntityMutationResolver(
      parentConfig,
      generalConfig,
      serversideConfig,
    );
    if (!pushIntoPerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const whereOne = { name: 'ParentName' };

    const info = createInfoEssence({ _id: 1, name: 1, places: 1, childs: 1 });

    const data = {
      childs: {
        create: [
          { textFields: ['textFields-pushed-1'], textField: 'textField-pushed-1' },
          // { textFields: ['textFields-pushed-2'], textField: 'textField-pushed-2' },
        ],
      },
    };
    const updatedParent = await pushIntoPerson(
      null,
      { data, whereOne },
      { mongooseConn, pubsub },
      info,
      { inputOutputEntity: [[]] },
    );

    expect(updatedParent.places).toEqual([]);

    const childs = await Child.find({});

    expect(childs.length).toEqual(1);
  });

  test('return simple int array', async () => {
    const exampleConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      intFields: [
        {
          name: 'numbers',
          array: true,
          type: 'intFields',
        },
      ],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: exampleConfig } };

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

    const createdExample = await createExample(
      null,
      { data: { numbers: [1, 2, 4, 5, 7] } },
      { mongooseConn, pubsub },
      null,
      { inputOutputEntity: [[]] },
    );

    const pushIntoExample = createPushIntoEntityMutationResolver(
      exampleConfig,
      generalConfig,
      serversideConfig,
    );
    if (!pushIntoExample) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const whereOne = { id: createdExample.id };

    const data = { numbers: [9, 3, 0, 6, 8] };
    const positions = { numbers: [9, 3, 0, 6, 8] };
    const pushedExample = await pushIntoExample(
      null,
      { data, positions, whereOne },
      { mongooseConn, pubsub },
      null,
      { inputOutputEntity: [[]] },
    );

    expect(pushedExample.numbers).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});
