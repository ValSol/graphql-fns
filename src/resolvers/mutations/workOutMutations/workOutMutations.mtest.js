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
} = require('../createCreateThingMutationResolver');
const { default: workOutMutations } = require('./index');

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-work-out-mutations';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

describe('createDeleteManyThingsMutationResolver', () => {
  const generalConfig: GeneralConfig = { thingConfigs: {} };
  test('should create mutation delete thing resolver with wipe out duplex fields values', async () => {
    const childConfig: ThingConfig = {};
    const parentConfig: ThingConfig = {
      name: 'Parent',
      textFields: [{ name: 'name' }],
      duplexFields: [
        {
          name: 'children',
          oppositeName: 'parent',
          array: true,
          config: childConfig,
        },
      ],
    };
    Object.assign(childConfig, {
      name: 'Child',
      textFields: [{ name: 'name' }],
      duplexFields: [
        {
          name: 'parent',
          oppositeName: 'children',
          config: parentConfig,
        },
      ],
    });

    const parentSchema = createThingSchema(parentConfig);
    const Parent = mongooseConn.model('Parent_Thing', parentSchema);
    await Parent.createCollection();

    const childSchema = createThingSchema(childConfig);
    const Child = mongooseConn.model('Child_Thing', childSchema);
    await Child.createCollection();

    await sleep(250);

    const serversideConfig = { transactions: true };
    const createPerson = createCreateThingMutationResolver(
      parentConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createPerson).toBe('function');
    if (!createPerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      name: 'Parent Name',
      children: {
        create: [{ name: 'Child Name 1' }, { name: 'Child Name 2' }, { name: 'Child Name 3' }],
      },
    };
    const createdParent = await createPerson(null, { data }, { mongooseConn, pubsub });

    expect(createdParent.name).toBe(data.name);
    expect(createdParent.children.length).toBe(data.children.create.length);

    const standardMutationsArgs = [
      {
        actionGeneralName: 'deleteThing',
        thingConfig: parentConfig,
        args: { whereOne: { id: createdParent.id } },
        returnResult: true,
      },
      {
        actionGeneralName: 'deleteManyThings',
        thingConfig: childConfig,
        args: { whereOne: createdParent.children.map(({ id }) => ({ id })) },
        returnResult: true,
      },
    ];

    const context = { mongooseConn, pubsub };

    const commonResolverCreatorArg = { generalConfig, serversideConfig, context };

    const result = await workOutMutations(standardMutationsArgs, commonResolverCreatorArg);

    expect(result[0]).toEqual(createdParent);
    expect(result[1].map(({ id }) => id)).toEqual(createdParent.children);

    const findedParent = await Parent.findById(createdParent.id);
    expect(findedParent).toBe(null);
    const findedChild1 = await Child.findById(createdParent.children[0]);
    expect(findedChild1).toBe(null);
    const findedChild2 = await Child.findById(createdParent.children[1]);
    expect(findedChild2).toBe(null);
    const findedChild3 = await Child.findById(createdParent.children[2]);
    expect(findedChild3).toBe(null);
  });
});
