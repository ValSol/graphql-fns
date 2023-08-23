/* eslint-env jest */
import type { GeneralConfig, EntityConfig, TangibleEntityConfig } from '../../../tsTypes';

import mongoose from 'mongoose';
import { PubSub } from 'graphql-subscriptions';

import mongoOptions from '../../../test/mongo-options';
import sleep from '../../../utils/sleep';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import createCreateEntityMutationResolver from '../../mutations/createCreateEntityMutationResolver';
import createEntityDistinctValuesQueryResolver from './index';

mongoose.set('strictQuery', false);

let mongooseConn;
let pubsub;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entity-distinct-values-query';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('createEntityDistinctValuesQueryResolver', () => {
  const generalConfig: GeneralConfig = { allEntityConfigs: {} };
  test('should create query entities resolver', async () => {
    const serversideConfig: Record<string, any> = {};
    const personConfig = {} as EntityConfig;
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
        {
          name: 'position',
          index: true,
          type: 'textFields',
        },
      ],
      duplexFields: [
        {
          name: 'friends',
          array: true,
          oppositeName: 'friends',
          config: personConfig,
          type: 'duplexFields',
        },
        {
          name: 'theBestFriend',
          oppositeName: 'theBestFriend',
          config: personConfig,
          type: 'duplexFields',
        },
      ],
    });

    const exampleSchema = createThingSchema(personConfig);
    const Example = mongooseConn.model('Person_Thing', exampleSchema);
    await Example.createCollection();

    await sleep(250);

    const createPerson = createCreateEntityMutationResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createPerson).toBe('function');
    if (!createPerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      firstName: 'Adam',
      lastName: 'Boss',
      position: 'boss',
      friends: {
        create: [
          { firstName: 'Andy', lastName: 'Mashkin', position: 'programmer' },
          { firstName: 'Adam', lastName: 'Daskin', position: 'programmer' },
          { firstName: 'Fred', lastName: 'Prashkin', position: 'programmer' },
        ],
      },
      theBestFriend: {
        create: {
          firstName: 'Stanislav',
          lastName: 'Bzhezinsky',
          position: 'programmer',
        },
      },
    };
    await createPerson(null, { data }, { mongooseConn, pubsub }, null, { inputOutputEntity: [[]] });

    const DistinctValues = createEntityDistinctValuesQueryResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    if (!DistinctValues) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const options = { target: 'firstName' };
    const distinctValues = await DistinctValues(null, { options }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[]],
    });
    expect(distinctValues).toEqual(['Adam', 'Andy', 'Fred', 'Stanislav']);

    const options2 = { target: 'lastName' };
    const distinctValues2 = await DistinctValues(
      null,
      { options: options2 },
      { mongooseConn, pubsub },
      null,
      { inputOutputEntity: [[]] },
    );
    expect(distinctValues2).toEqual(['Boss', 'Bzhezinsky', 'Daskin', 'Mashkin', 'Prashkin']);

    const options3 = { target: 'position' };
    const distinctValues3 = await DistinctValues(
      null,
      { options: options3 },
      { mongooseConn, pubsub },
      null,
      { inputOutputEntity: [[]] },
    );
    expect(distinctValues3).toEqual(['boss', 'programmer']);
  });

  test('should create query entity DistinctValues resolver to aggregate result', async () => {
    const serversideConfig: Record<string, any> = {};

    const parentConfig = {} as TangibleEntityConfig;
    const childConfig: EntityConfig = {
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
          config: parentConfig,
          array: true,
          parent: true,
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

    const exampleSchema = createThingSchema(parentConfig);
    const Example = mongooseConn.model('Parent_Thing', exampleSchema);
    await Example.createCollection();

    const exampleSchema2 = createThingSchema(childConfig);
    const Example2 = mongooseConn.model('Child_Thing', exampleSchema2);
    await Example2.createCollection();

    await sleep(250);

    const createParent = createCreateEntityMutationResolver(
      parentConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createParent).toBe('function');
    if (!createParent) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    for (let i = 0; i < 20; i += 1) {
      const data = {
        name: `name${Math.floor(i / 3)}`,
        child: {
          create: {
            textFields: [`text-${i}`],
            textField: i < 15 ? 'first' : 'second',
          },
        },
      };
      // eslint-disable-next-line no-await-in-loop
      await createParent(null, { data }, { mongooseConn, pubsub }, null, {
        inputOutputEntity: [[]],
      });
    }

    const DistinctValues = createEntityDistinctValuesQueryResolver(
      parentConfig,
      generalConfig,
      serversideConfig,
    );
    if (!DistinctValues) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const where = {
      child_: { textFields_in: ['text-3', 'text-4', 'text-12', 'text-99'] },
    };
    const options = { target: 'name' };
    const distinctValues3 = await DistinctValues(
      null,
      { options, where },
      { mongooseConn, pubsub },
      null,
      { inputOutputEntity: [[]] },
    );
    expect(distinctValues3).toEqual(['name1', 'name4']);
  });
});
