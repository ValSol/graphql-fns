// @flow
/* eslint-env jest */
import type { GeneralConfig, ThingConfig } from '../../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../../test/mongo-options');
const { default: sleep } = require('../../../utils/sleep');
const { default: createThingSchema } = require('../../../mongooseModels/createThingSchema');
const {
  default: createCreateThingMutationResolver,
} = require('../../mutations/createCreateThingMutationResolver');
const { default: info } = require('../../utils/info.auxiliary.js');
const { default: createThingQueryResolver } = require('./index');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-create-thing-query';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('createThingQueryResolver', () => {
  const generalConfig: GeneralConfig = { thingConfigs: {} };
  const serversideConfig = {};
  test('should create query thing resolver', async () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField1',
          unique: true,
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

    const exampleSchema = createThingSchema(thingConfig);
    const ExampleThing = mongooseConn.model('Example_Thing', exampleSchema);
    await ExampleThing.createCollection();

    await sleep(250);

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
    const { id } = createdExample;

    const Example = createThingQueryResolver(thingConfig, generalConfig, serversideConfig);
    if (!Example) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const whereOne = { id };
    const example = await Example(null, { whereOne }, { mongooseConn, pubsub }, info);

    expect(example.textField1).toBe(data.textField1);
    expect(example.textField2).toBeUndefined();
    expect(example.textField3).toBe(data.textField3);
    expect(example.textField4).toBeUndefined();
    expect(example.textField5).toBeUndefined();
    expect(example.createdAt instanceof Date).toBeTruthy();
    expect(example.updatedAt).toBeUndefined();

    const whereOne2 = { textField1: data.textField1 };
    const example2 = await Example(null, { whereOne: whereOne2 }, { mongooseConn, pubsub }, info);

    expect(example2.textField1).toBe(data.textField1);
    expect(example2.textField2).toBeUndefined();
    expect(example2.textField3).toBe(data.textField3);
    expect(example2.textField4).toBeUndefined();
    expect(example2.textField5).toBeUndefined();
    expect(example2.createdAt instanceof Date).toBeTruthy();
    expect(example2.updatedAt).toBeUndefined();
  });

  test('should create query things resolver to aggregate result', async () => {
    const childConfig: ThingConfig = {
      name: 'Child',
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
    const parentConfig: ThingConfig = {
      name: 'Parent',
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

    const exampleSchema = createThingSchema(parentConfig);
    const ExampleThing = mongooseConn.model('Parent_Thing', exampleSchema);
    await ExampleThing.createCollection();

    const exampleSchema2 = createThingSchema(childConfig);
    const ExampleThing2 = mongooseConn.model('Child_Thing', exampleSchema2);
    await ExampleThing2.createCollection();

    await sleep(250);

    const createParent = createCreateThingMutationResolver(
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

    const Parent = createThingQueryResolver(parentConfig, generalConfig, serversideConfig);
    if (!Parent) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const info2 = { projection: { _id: 1, name: 1 } };
    const whereOne = {
      AND: [
        { name: 'name-2' },
        { child_: { textFields_in: ['text-2', 'text-4', 'text-12', 'text-99'] } },
      ],
    };
    const parent = await Parent(null, { whereOne }, { mongooseConn, pubsub }, info2, []);

    expect(parent.name).toBe('name-2');

    const whereOne2 = {
      AND: [
        { name: 'name-1' },
        { child_: { textFields_in: ['text-2', 'text-4', 'text-12', 'text-99'] } },
      ],
    };
    const parent2 = await Parent(
      null,
      { whereOne: whereOne2 },
      { mongooseConn, pubsub },
      info2,
      [],
    );

    expect(parent2).toBe(null);
  });
});
