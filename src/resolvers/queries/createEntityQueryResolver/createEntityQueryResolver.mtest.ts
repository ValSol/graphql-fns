/* eslint-env jest */

import mongoose from 'mongoose';

import type { GeneralConfig, EntityConfig, TangibleEntityConfig } from '@/tsTypes';

import mongoOptions from '@/test/mongo-options';
import sleep from '@/utils/sleep';
import createThingSchema from '@/mongooseModels/createThingSchema';
import createInfoEssence from '@/resolvers/utils/createInfoEssence';
import pubsub from '@/resolvers/utils/pubsub';
import createCreateEntityMutationResolver from '@/resolvers/mutations/createCreateEntityMutationResolver';
import createEntityQueryResolver from './index';

const info = createInfoEssence({ textField1: 1, textField3: 1, createdAt: 1 });

mongoose.set('strictQuery', false);

let mongooseConn: any;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entity-query';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

describe('createEntityQueryResolver', () => {
  const serversideConfig: Record<string, any> = {};
  test('should create query entity resolver', async () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',

      uniqueCompoundIndexes: [['textField2', 'textField3']],

      textFields: [
        {
          name: 'textField1',
          unique: true,
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

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const exampleSchema = createThingSchema(entityConfig);
    const ExampleEntity = mongooseConn.model('Example_Thing', exampleSchema);
    await ExampleEntity.createCollection();

    await sleep(250);

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
    const { id } = createdExample;

    const Example = createEntityQueryResolver(entityConfig, generalConfig, serversideConfig);
    if (!Example) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const whereOne = { id };
    const example = await Example(null, { whereOne }, { mongooseConn, pubsub }, info, {
      inputOutputEntity: [[]],
    });

    expect(example.textField1).toBe(data.textField1);
    expect(example.textField2).toBeUndefined();
    expect(example.textField3).toBe(data.textField3);
    expect(example.textField4).toBeUndefined();
    expect(example.textField5).toBeUndefined();
    expect(example.createdAt instanceof Date).toBeTruthy();
    expect(example.updatedAt).toBeUndefined();

    const whereOne2 = { textField1: data.textField1 };
    const example2 = await Example(null, { whereOne: whereOne2 }, { mongooseConn, pubsub }, info, {
      inputOutputEntity: [[]],
    });

    expect(example2.textField1).toBe(data.textField1);
    expect(example2.textField2).toBeUndefined();
    expect(example2.textField3).toBe(data.textField3);
    expect(example2.textField4).toBeUndefined();
    expect(example2.textField5).toBeUndefined();
    expect(example2.createdAt instanceof Date).toBeTruthy();
    expect(example2.updatedAt).toBeUndefined();

    const whereCompoundOne = { textField2: data.textField2, textField3: data.textField3 };
    const example3 = await Example(null, { whereCompoundOne }, { mongooseConn, pubsub }, info, {
      inputOutputEntity: [[]],
    });

    expect(example3.textField1).toBe(data.textField1);
    expect(example3.textField2).toBeUndefined();
    expect(example3.textField3).toBe(data.textField3);
    expect(example3.textField4).toBeUndefined();
    expect(example3.textField5).toBeUndefined();
    expect(example3.createdAt instanceof Date).toBeTruthy();
    expect(example3.updatedAt).toBeUndefined();
  });

  test('should create query entities resolver to aggregate result', async () => {
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

    const exampleSchema = createThingSchema(parentConfig);
    const ExampleEntity = mongooseConn.model('Parent_Thing', exampleSchema);
    await ExampleEntity.createCollection();

    const exampleSchema2 = createThingSchema(childConfig);
    const ExampleEntity2 = mongooseConn.model('Child_Thing', exampleSchema2);
    await ExampleEntity2.createCollection();

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
        inputOutputEntity: [[]],
      });
    }

    const Parent = createEntityQueryResolver(parentConfig, generalConfig, serversideConfig);
    if (!Parent) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const info2 = createInfoEssence({ _id: 1, name: 1 });
    const whereOne = {
      AND: [
        { name: 'name-2' },
        { child_: { textFields_in: ['text-2', 'text-4', 'text-12', 'text-99'] } },
      ],
    };
    const parent = await Parent(null, { whereOne }, { mongooseConn, pubsub }, info2, {
      inputOutputEntity: [[]],
    });

    expect(parent.name).toBe('name-2');

    const whereOne2 = {
      AND: [
        { name: 'name-1' },
        { child_: { textFields_in: ['text-2', 'text-4', 'text-12', 'text-99'] } },
      ],
    };
    const parent2 = await Parent(null, { whereOne: whereOne2 }, { mongooseConn, pubsub }, info2, {
      inputOutputEntity: [[]],
    });

    expect(parent2).toBe(null);
  });
});
