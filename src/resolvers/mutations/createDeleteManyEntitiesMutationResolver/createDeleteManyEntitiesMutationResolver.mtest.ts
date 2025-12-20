/* eslint-env jest */

import mongoose from 'mongoose';

import type { GeneralConfig, TangibleEntityConfig } from '@/tsTypes';

import mongoOptions from '@/test/mongo-options';
import createThingSchema from '@/mongooseModels/createThingSchema';
import createInfoEssence from '@/resolvers/utils/createInfoEssence';
import pubsub from '@/resolvers/utils/pubsub';
import createCreateEntityMutationResolver from '../createCreateEntityMutationResolver';
import createDeleteManyEntitiesMutationResolver from './index';

mongoose.set('strictQuery', false);

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-delete-many-entities-mutation';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

describe('createDeleteManyEntitiesMutationResolver', () => {
  test('should create mutation delete entity resolver with wipe out duplex fields values', async () => {
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
    await Person.init();
    await Person.createCollection();

    const placeSchema = createThingSchema(placeConfig);
    const Place = mongooseConn.model('Place_Thing', placeSchema);
    await Place.init();
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
      involvedFilters: { inputOutputFilterAndLimit: [[]] },
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

    const deletePerson = createDeleteManyEntitiesMutationResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    if (!deletePerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const info = createInfoEssence({
      projection: {
        firstName: 1,
        lastName: 1,
        friend: 1,
        location: 1,
        locations: 1,
        favorities: 1,
      },
    });

    const whereOne = [{ id }];
    const [deletedPerson] = await deletePerson(null, { whereOne }, { mongooseConn, pubsub }, info, {
      involvedFilters: { inputOutputFilterAndLimit: [[]] },
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

    const deletedPerson2 = await deletePerson(null, { whereOne }, { mongooseConn, pubsub }, info, {
      involvedFilters: { inputOutputFilterAndLimit: [[]] },
    });
    expect(deletedPerson2).toBeNull();

    const deletePlace = createDeleteManyEntitiesMutationResolver(
      placeConfig,
      generalConfig,
      serversideConfig,
    );
    if (!deletePlace) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const info2 = createInfoEssence({ projection: { name: 1 } });

    const where2 = [{ name: data.location.create.name }];
    const [deletedPlace] = await deletePlace(
      null,
      { whereOne: where2 },
      { mongooseConn, pubsub },
      info2,
      { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
    );

    expect(deletedPlace.id).not.toBe(undefined);
    expect(deletedPlace.name).toBe(data.location.create.name);

    const deletedPlace2 = await deletePlace(
      null,
      { whereOne: where2 },
      { mongooseConn, pubsub },
      info2,
      { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
    );
    expect(deletedPlace2).toBeNull();
  });

  test('should create mutation deleteManyEntities resolver to aggregate result', async () => {
    const serversideConfig = { transactions: true };

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
          name: 'child',
          oppositeName: 'parentChild',
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
      ],

      relationalFields: [
        {
          name: 'child',
          oppositeName: 'parentChild',
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
    await Parent.init();
    await Parent.createCollection();

    const childSchema = createThingSchema(childConfig);
    const Child = mongooseConn.model('Child_Thing', childSchema);
    await Child.init();
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
      await createParent(null, { data }, { mongooseConn, pubsub }, null, {
        involvedFilters: { inputOutputFilterAndLimit: [[]] },
      });
    }

    const deletePerson = createDeleteManyEntitiesMutationResolver(
      parentConfig,
      generalConfig,
      serversideConfig,
    );
    if (!deletePerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const whereOne = [
      {
        AND: [
          { name: 'name-2' },
          { child_: { textFields_in: ['text-2', 'text-4', 'text-12', 'text-99'] } },
        ],
      },
    ];

    const info = createInfoEssence({ projection: { _id: 1, name: 1 } });
    const [deletedParent] = await deletePerson(null, { whereOne }, { mongooseConn, pubsub }, info, {
      involvedFilters: { inputOutputFilterAndLimit: [[]] },
    });

    expect(deletedParent.name).toBe('name-2');

    const whereOne2 = [
      {
        AND: [
          { name: 'name-1' },
          { child_: { textFields_in: ['text-2', 'text-4', 'text-12', 'text-99'] } },
        ],
      },
    ];

    const deletedParent2 = await deletePerson(
      null,
      { whereOne: whereOne2 },
      { mongooseConn, pubsub },
      info,
      { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
    );

    expect(deletedParent2).toBe(null);
  });

  test('should create mutation deleteManyEntities resolver and return []', async () => {
    const serversideConfig = { transactions: true };

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
      ],

      relationalFields: [
        {
          name: 'child',
          oppositeName: 'parentChild',
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
    await Parent.init();
    await Parent.createCollection();

    const childSchema = createThingSchema(childConfig);
    const Child = mongooseConn.model('Child_Thing', childSchema);
    await Child.init();
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
      await createParent(null, { data }, { mongooseConn, pubsub }, null, {
        involvedFilters: { inputOutputFilterAndLimit: [[]] },
      });
    }

    const deletePerson = createDeleteManyEntitiesMutationResolver(
      parentConfig,
      generalConfig,
      serversideConfig,
    );
    if (!deletePerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const whereOne: Array<never> = [];

    const info = createInfoEssence({ projection: { _id: 1, name: 1 } });
    const deletedParents = await deletePerson(null, { whereOne }, { mongooseConn, pubsub }, info, {
      involvedFilters: { inputOutputFilterAndLimit: [[]] },
    });

    expect(deletedParents).toEqual([]);
  });
});
