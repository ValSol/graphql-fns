/* eslint-env jest */
import type { GeneralConfig, TangibleEntityConfig } from '../../../tsTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../../test/mongo-options');
const { default: createThingSchema } = require('../../../mongooseModels/createThingSchema');
const { default: createCreateEntityMutationResolver } = require('./index');

mongoose.set('strictQuery', false);

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-create-entity-mutation';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
  pubsub = new PubSub();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('createCreateEntityMutationResolver', () => {
  const generalConfig: GeneralConfig = { allEntityConfigs: {} };
  const serversideConfig = { transactions: true };
  test('should create mutation add entity resolver', async () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      counter: true,
      textFields: [
        {
          name: 'textField1',
          type: 'textFields',
        },
        {
          name: 'textField2',
          default: 'default text',
          type: 'textFields',
        },
        {
          name: 'textField3',
          required: true,
          type: 'textFields',
        },
        {
          name: 'textField4',
          array: true,
          type: 'textFields',
        },
        {
          name: 'textField5',
          default: ['default text'],
          required: true,
          array: true,
          type: 'textFields',
        },
      ],
    };

    const exampleSchema = createThingSchema(entityConfig);
    const Example = mongooseConn.model('Example_Thing', exampleSchema);
    await Example.createCollection();

    const createExample = createCreateEntityMutationResolver(
      entityConfig,
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

    const createdExample = await createExample(null, { data }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[]],
    });
    const createdExample2 = await createExample(null, { data }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[]],
    });
    const createdExample3 = await createExample(null, { data }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[]],
    });

    expect(createdExample.textField1).toBe(data.textField1);
    expect(createdExample.textField2).toBe(data.textField2);
    expect(createdExample.textField3).toBe(data.textField3);
    expect(createdExample.textField4).toEqual(data.textField4);
    expect(createdExample.textField5).toEqual(data.textField5);
    expect(createdExample.createdAt instanceof Date).toBeTruthy();
    expect(createdExample.updatedAt instanceof Date).toBeTruthy();
    expect(createdExample.counter).toBe(1);
    expect(createdExample2.counter).toBe(2);
    expect(createdExample3.counter).toBe(3);
  });

  test('should create mutation add entity resolver adding relations', async () => {
    const personConfig = {} as TangibleEntityConfig;
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
      relationalFields: [
        {
          name: 'friend',
          config: personConfig,
          type: 'relationalFields',
        },
        {
          name: 'friends',
          config: personConfig,
          array: true,
          type: 'relationalFields',
        },
      ],
    });

    const personSchema = createThingSchema(personConfig);
    const Person = mongooseConn.model('Person_Thing', personSchema);
    await Person.createCollection();

    const createPerson = createCreateEntityMutationResolver(
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

    const createdPerson = await createPerson(null, { data }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[]],
    });
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
    expect(createdPerson2.friend.toString()).toBe(data2.friend.connect.toString());
    expect(createdPerson2.friends[0].toString()).toBe(data2.friends.connect[0].toString());
  });

  test('should create mutation add entity resolver that create related entities', async () => {
    const cityConfig = { name: 'City', type: 'tangible', textFields: [{ name: 'name' }] };
    const placeConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name', type: 'textFields' }],
      relationalFields: [{ name: 'capital', config: cityConfig, type: 'relationalFields' }],
    };
    const personConfig: Record<string, any> = {};
    Object.assign(personConfig, {
      name: 'Person2',
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
      relationalFields: [
        {
          name: 'friend',
          config: personConfig,
          type: 'relationalFields',
        },
        {
          name: 'friends',
          config: personConfig,
          array: true,
          type: 'relationalFields',
        },
        {
          name: 'location',
          config: placeConfig,
          type: 'relationalFields',
        },
        {
          name: 'favorities',
          config: placeConfig,
          array: true,
          type: 'relationalFields',
        },
      ],
    });

    const personSchema = createThingSchema(personConfig);
    const Person = mongooseConn.model('Person2_Thing', personSchema);
    await Person.createCollection();

    const placeSchema = createThingSchema(placeConfig);
    const Place = mongooseConn.model('Place_Thing', placeSchema);
    await Place.createCollection();

    const citySchema = createThingSchema(cityConfig);
    const City = mongooseConn.model('City_Thing', citySchema);
    await City.createCollection();

    const createPerson = createCreateEntityMutationResolver(
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

    const createdPerson = await createPerson(null, { data }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[]],
    });

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

    const { friend: friendId, friends: friendIds } = createdPerson2;

    const createdFriend = await Person.findById(friendId);
    expect(createdFriend.firstName).toBe(data2.friend.create.firstName);
    expect(createdFriend.lastName).toBe(data2.friend.create.lastName);
    expect(createdFriend.createdAt instanceof Date).toBeTruthy();
    expect(createdFriend.updatedAt instanceof Date).toBeTruthy();

    const createdFriends = await Person.find({ _id: { $in: friendIds } });
    expect(createdFriends[0].firstName).toBe(data.firstName);
    expect(createdFriends[0].lastName).toBe(data.lastName);
    expect(createdFriends[0].counter).toBe(1);
    expect(createdFriends[1].firstName).toBe(data2.friends.create[0].firstName);
    expect(createdFriends[1].lastName).toBe(data2.friends.create[0].lastName);
    expect(createdFriends[1].counter).toBe(4);
    expect(createdFriends[2].firstName).toBe(data2.friends.create[1].firstName);
    expect(createdFriends[2].lastName).toBe(data2.friends.create[1].lastName);
    expect(createdFriends[2].counter).toBe(5);
  });

  test('should create mutation add entity resolver that create duplex related entities', async () => {
    const personConfig = {} as TangibleEntityConfig;
    const placeConfig: TangibleEntityConfig = {
      name: 'Place2',
      type: 'tangible',
      textFields: [{ name: 'name', type: 'textFields' }],
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
          required: true,
          type: 'duplexFields',
        },
      ],
    };
    Object.assign(personConfig, {
      name: 'Person3',
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
          // required: true,
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

    const personSchema = createThingSchema(personConfig);
    const Person = mongooseConn.model('Person3_Thing', personSchema);
    const placeSchema = createThingSchema(placeConfig);
    const Place = mongooseConn.model('Place2_Thing', placeSchema);

    await Person.createCollection();
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

    const data2 = {
      firstName: 'Nina',
      lastName: 'Richi',
      friend: {
        connect: id.toString(),
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

    const createdPerson2 = await createPerson(
      null,
      { data: data2 },
      { mongooseConn, pubsub },
      null,
      { inputOutputEntity: [[]] },
    );
    expect(createdPerson2.firstName).toBe(data2.firstName);
    expect(createdPerson2.lastName).toBe(data2.lastName);
    expect(createdPerson.createdAt instanceof Date).toBeTruthy();
    expect(createdPerson.updatedAt instanceof Date).toBeTruthy();

    const {
      friend: friendId2,
      id: id2,
      location: locationId2,
      locations: locationIds2,
      favorities: favoritieIds2,
    } = createdPerson2;

    expect(friendId2).toEqual(id);
    expect(locationId2).toEqual(locationId);
    expect(locationIds2).toEqual(locationIds);
    expect(favoritieIds2).toEqual(favoritieIds);

    const createdFriend2 = await Person.findById(friendId2);
    expect(createdFriend2.firstName).toBe(data.firstName);
    expect(createdFriend2.lastName).toBe(data.lastName);
    expect(createdFriend2.friend).toEqual(id2);

    const createdLocation2 = await Place.findById(locationId2);
    expect(createdLocation2.citizens[1]).toEqual(id2);

    const createdLocations2 = await Place.find({ _id: { $in: locationIds2 } });
    expect(createdLocations2[0].curator).toEqual(id2);
    expect(createdLocations2[1].curator).toEqual(id2);

    const createdFavorities2 = await Place.find({ _id: { $in: favoritieIds2 } });
    expect(createdFavorities2[0].visitors[1]).toEqual(id2);
    expect(createdFavorities2[1].visitors[1]).toEqual(id2);
  });

  test('should update mongodb documents using periphery objects', async () => {
    const personConfig = {} as TangibleEntityConfig;
    const placeConfig: TangibleEntityConfig = {
      name: 'Place3',
      type: 'tangible',
      textFields: [{ name: 'name', type: 'textFields' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
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
      name: 'Person4',
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
          type: 'duplexFields',
        },
        {
          name: 'locations',
          oppositeName: 'curator',
          config: placeConfig,
          array: true,
          type: 'duplexFields',
        },
      ],
    });

    const personSchema = createThingSchema(personConfig);
    const Person = mongooseConn.model('Person4_Thing', personSchema);
    const placeSchema = createThingSchema(placeConfig);
    const Place = mongooseConn.model('Place3_Thing', placeSchema);

    await Person.createCollection();
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
    };
    const createdPerson = await createPerson(null, { data }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[]],
    });
    expect(createdPerson.firstName).toBe(data.firstName);
    expect(createdPerson.lastName).toBe(data.lastName);
    expect(createdPerson.locations.length).toBe(2);
    expect(createdPerson.createdAt instanceof Date).toBeTruthy();
    expect(createdPerson.updatedAt instanceof Date).toBeTruthy();

    const { friend: friendId, id, location: locationId, locations: locationIds } = createdPerson;

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

    const data2 = {
      firstName: 'Nina',
      lastName: 'Richi',
      friend: {
        connect: id,
      },
      location: {
        connect: locationId,
      },
      locations: {
        connect: [locationIds[0], locationIds[1]],
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
    expect(createdPerson.createdAt instanceof Date).toBeTruthy();
    expect(createdPerson.updatedAt instanceof Date).toBeTruthy();

    const connectedFriend = await Person.findById(createdPerson2.friend);
    expect(connectedFriend.firstName).toBe(data.firstName);
    expect(connectedFriend.lastName).toBe(data.lastName);
    expect(connectedFriend.locations.length).toBe(0);

    const oldCreatedFriend = await Person.findById(friendId);
    expect(oldCreatedFriend.friend).toBeUndefined();

    // const session = await mongooseConn.startSession();

    // session.startTransaction();
    // await Person.create([{ firstName: 'firstNameTest', lastName: 'lastNameTest' }], {
    //   session,
    // });
    // // await session.abortTransaction();
    // let doc = await Person.findOne({ firstName: 'firstNameTest' });
    // expect(doc).toBe(null);

    // await session.commitTransaction();
    // session.endSession();

    // doc = await Person.findOne({ firstName: 'firstNameTest' });
    // expect(doc.firstName).toBe('firstNameTest');
  });

  test('should create mongodb documents using checkData', async () => {
    const accessConfig: TangibleEntityConfig = {
      name: 'Access',
      type: 'tangible',

      textFields: [
        { name: 'postCreators', array: true, index: true, type: 'textFields' },
        { name: 'postEditors', array: true, index: true, type: 'textFields' },
        { name: 'postPublishers', array: true, index: true, type: 'textFields' },
        { name: 'postTogglers', array: true, index: true, type: 'textFields' },
        { name: 'restaurantCreators', array: true, index: true, type: 'textFields' },
        { name: 'restaurantEditors', array: true, index: true, type: 'textFields' },
        { name: 'restaurantPublishers', array: true, index: true, type: 'textFields' },
        { name: 'restaurantTogglers', array: true, index: true, type: 'textFields' },
      ],
    };

    const postConfig = {} as TangibleEntityConfig;
    const restaurantConfig = {} as TangibleEntityConfig;

    Object.assign(postConfig, {
      name: 'Post',
      type: 'tangible',

      textFields: [
        { name: 'slug', type: 'textFields' },
        { name: 'type', type: 'textFields' },
      ],

      relationalFields: [
        {
          name: 'restaurant',
          config: restaurantConfig,
          index: true,
          type: 'relationalFields',
        },
        {
          name: 'restaurants',
          config: restaurantConfig,
          array: true,
          index: true,
          type: 'relationalFields',
        },
      ],
    });

    Object.assign(restaurantConfig, {
      name: 'Restaurant',
      type: 'tangible',

      textFields: [{ name: 'slug', type: 'textFields' }],

      relationalFields: [
        {
          name: 'access',
          config: accessConfig,
          index: true,
          type: 'relationalFields',
        },
      ],
    });

    const generalConfig2: GeneralConfig = {
      allEntityConfigs: { Access: accessConfig, Post: postConfig, Restaurant: restaurantConfig },
    };

    const accessSchema = createThingSchema(accessConfig);
    const Access = mongooseConn.model('Access_Thing', accessSchema);
    await Access.createCollection();

    const postSchema = createThingSchema(postConfig);
    const Post = mongooseConn.model('Post_Thing', postSchema);
    await Post.createCollection();

    const restaurantSchema = createThingSchema(restaurantConfig);
    const Restaurant = mongooseConn.model('Restaurant_Thing', restaurantSchema);
    await Restaurant.createCollection();

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
      { inputOutputEntity: [[]] },
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
      inputOutputEntity: [[{ restaurant_: { access_: { postCreators: '9876543210' } } }]],
    });

    expect(post).toBe(null);

    const post2 = await createPost(null, { data: postData }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[{ restaurant_: { access_: { postCreators: '1234567890' } } }]],
    });

    expect(post2.restaurant.toString()).toBe(restaurantId.toString());

    const postData3 = {
      slug: 'news',
      type: 'newsFeed',
      restaurant: { connect: null },
    };

    const post3 = await createPost(null, { data: postData3 }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[{ restaurant_: { access_: { postCreators: '1234567890' } } }]],
    });

    expect(post3).toBe(null);

    const postData4 = {
      slug: 'news',
      type: 'newsFeed',
      restaurants: { connect: [restaurantId] },
    };

    const post4 = await createPost(null, { data: postData4 }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[{ restaurants_: { access_: { postCreators: '1234567890' } } }]],
    });

    expect(post4.restaurants[0].toString()).toBe(restaurantId.toString());

    const postData5 = {
      slug: 'news',
      type: 'newsFeed',
      restaurants: { connect: [] },
    };

    const post5 = await createPost(null, { data: postData5 }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[{ restaurants_: { access_: { postCreators: '1234567890' } } }]],
    });

    expect(post5).toBe(null);

    const postData6 = {
      slug: 'news',
      type: 'newsFeed',
      restaurants: { connect: [restaurantId, `${restaurantId.toString().slice(0, -1)}a`] },
    };

    const post6 = await createPost(null, { data: postData6 }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[{ restaurants_: { access_: { postCreators: '1234567890' } } }]],
    });

    expect(post6.restaurants[0].toString()).toBe(restaurantId.toString());

    const postData7 = {
      slug: 'news',
      type: 'newsFeed',
      restaurants: { connect: ['6073f383f1b1bcd591983c92'] },
    };

    const post7 = await createPost(null, { data: postData7 }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[{ restaurants_: { access_: { postCreators: '1234567890' } } }]],
    });

    expect(post7).toBe(null);

    const postData8 = {
      slug: 'news',
      type: 'newsFeed',
      restaurant: { connect: restaurantId },
      restaurants: { connect: [restaurantId] },
    };

    const post8 = await createPost(null, { data: postData8 }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [
        [
          {
            restaurants_: { access_: { postCreators: '1234567890' } },
            restaurant_: { access_: { postCreators: '1234567890' } },
          },
        ],
      ],
    });

    expect(post8.restaurants[0].toString()).toBe(restaurantId.toString());

    const postData9 = {
      slug: 'news',
      type: 'newsFeed',
      restaurant: { connect: '6073f383f1b1bcd591983c92' },
      restaurants: { connect: [restaurantId] },
    };

    const post9 = await createPost(null, { data: postData9 }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [
        [
          {
            restaurants_: { access_: { postCreators: '1234567890' } },
            restaurant_: { access_: { postCreators: '1234567890' } },
          },
        ],
      ],
    });

    expect(post9).toBe(null);

    const postData10 = {
      slug: 'news',
      type: 'newsFeed',
      restaurant: { connect: restaurantId },
      restaurants: { connect: [restaurantId] },
    };

    const post10 = await createPost(null, { data: postData10 }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [
        [
          {
            type: 'newsFeed',
            restaurant_: { access_: { postCreators: '1234567890' } },
          },
        ],
      ],
    });

    expect(post10.type).toBe(postData10.type);

    const postData11 = {
      slug: 'news',
      type: 'toProfessionals',
      restaurant: { connect: restaurantId },
      restaurants: { connect: [restaurantId] },
    };

    const post11 = await createPost(null, { data: postData11 }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [
        [
          {
            type: 'newsFeed',
            restaurant_: { access_: { postCreators: '1234567890' } },
          },
        ],
      ],
    });

    expect(post11).toBe(null);
  });
});
