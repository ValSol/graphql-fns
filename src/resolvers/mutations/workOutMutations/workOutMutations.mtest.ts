/* eslint-env jest */

import mongoose from 'mongoose';

import type { GeneralConfig, TangibleEntityConfig } from '../../../tsTypes';

import mongoOptions from '../../../test/mongo-options';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import pubsub from '../../utils/pubsub';
import createCreateEntityMutationResolver from '../createCreateEntityMutationResolver';
import workOutMutations from './index';
import createCopyEntityMutationResolver from '../createCopyEntityMutationResolver';

mongoose.set('strictQuery', false);

let mongooseConn;

const exampleConfig: TangibleEntityConfig = {
  name: 'Example',
  type: 'tangible',

  textFields: [
    { name: 'name', required: true, type: 'textFields' },
    { name: 'label', type: 'textFields' },
  ],

  intFields: [{ name: 'counts', array: true, type: 'intFields' }],

  calculatedFields: [
    {
      name: 'nameAndLabel',
      calculatedType: 'textFields',
      fieldsToUseNames: ['name', 'label'],
      func: (args, { name, label }: any) => `${name} with label: "${label}"` as string,
      type: 'calculatedFields',
    },
  ],
};

const exampleCloneConfig: TangibleEntityConfig = {
  name: 'ExampleClone',
  type: 'tangible',

  textFields: [
    { name: 'name', type: 'textFields' },
    { name: 'label', type: 'textFields' },
  ],
  intFields: [{ name: 'counts', array: true, type: 'intFields' }],
};

const childConfig = {} as TangibleEntityConfig;
const personConfig = {} as TangibleEntityConfig;
const personCloneConfig = {} as TangibleEntityConfig;
const menuConfig = {} as TangibleEntityConfig;
const menuCloneConfig = {} as TangibleEntityConfig;
const menuSectionConfig = {} as TangibleEntityConfig;
const menuSectionCloneConfig = {} as TangibleEntityConfig;
const restaurantConfig = {} as TangibleEntityConfig;
const restaurantArchiveConfig = {} as TangibleEntityConfig;
const restaurantCloneConfig = {} as TangibleEntityConfig;
const restaurantBackupConfig = {} as TangibleEntityConfig;

const parentConfig: TangibleEntityConfig = {
  name: 'Parent',
  type: 'tangible',
  textFields: [{ name: 'name', type: 'textFields' }],
  duplexFields: [
    {
      name: 'children',
      oppositeName: 'parent',
      array: true,
      config: childConfig,
      type: 'duplexFields',
    },
  ],
};

Object.assign(childConfig, {
  name: 'Child',
  type: 'tangible',
  textFields: [{ name: 'name', type: 'textFields' }],
  duplexFields: [
    {
      name: 'parent',
      oppositeName: 'children',
      config: parentConfig,
      type: 'duplexFields',
    },
  ],
});

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
      type: 'textFields',
    },
  ],
  duplexFields: [
    {
      name: 'clone',
      oppositeName: 'original',
      config: personCloneConfig,
      type: 'duplexFields',
    },
  ],
});

Object.assign(personCloneConfig, {
  name: 'PersonClone',
  type: 'tangible',

  textFields: [
    {
      name: 'firstName',
      required: true,
      type: 'textFields',
    },

    {
      name: 'lastName',
      type: 'textFields',
    },
  ],

  duplexFields: [
    {
      name: 'original',
      oppositeName: 'clone',
      config: personConfig,
      required: true,
      type: 'duplexFields',
    },
  ],
});

Object.assign(menuConfig, {
  name: 'Menu',
  type: 'tangible',

  textFields: [
    {
      name: 'name',
      required: true,
      type: 'textFields',
    },
  ],

  duplexFields: [
    {
      name: 'clone',
      oppositeName: 'original',
      config: menuCloneConfig,
      type: 'duplexFields',
    },

    {
      name: 'sections',
      oppositeName: 'menu',
      array: true,
      config: menuSectionConfig,
      parent: true,
    },
  ],
});

Object.assign(menuCloneConfig, {
  name: 'MenuClone',
  type: 'tangible',

  textFields: [
    {
      name: 'name',
      required: true,
      type: 'textFields',
    },
  ],

  duplexFields: [
    {
      name: 'original',
      oppositeName: 'clone',
      config: menuConfig,
      required: true,
      type: 'duplexFields',
    },

    {
      name: 'sections',
      oppositeName: 'menu',
      array: true,
      config: menuSectionCloneConfig,
      parent: true,
    },
  ],
});

Object.assign(menuSectionConfig, {
  name: 'MenuSection',
  type: 'tangible',

  textFields: [
    {
      name: 'name',
      required: true,
      type: 'textFields',
    },
  ],

  duplexFields: [
    {
      name: 'menu',
      oppositeName: 'sections',
      config: menuConfig,
      type: 'duplexFields',
    },
  ],
});

Object.assign(menuSectionCloneConfig, {
  name: 'MenuCloneSection',
  type: 'tangible',

  textFields: [
    {
      name: 'name',
      required: true,
      type: 'textFields',
    },
  ],

  duplexFields: [
    {
      name: 'menu',
      oppositeName: 'sections',
      config: menuCloneConfig,
      type: 'duplexFields',
    },
  ],
});

Object.assign(restaurantConfig, {
  name: 'Restaurant',
  type: 'tangible',

  textFields: [
    {
      name: 'title',
      type: 'textFields',
    },

    {
      name: 'comments',
      array: true,
      type: 'textFields',
    },
  ],

  duplexFields: [
    {
      name: 'clone',
      oppositeName: 'original',
      config: restaurantCloneConfig,
      freeze: true,
      index: true,
      parent: true,
      type: 'duplexFields',
    },

    {
      name: 'backup',
      oppositeName: 'original',
      config: restaurantBackupConfig,
      index: true,
      parent: true,
      type: 'duplexFields',
    },

    {
      name: 'archive', // archive2
      oppositeName: 'original2',
      config: restaurantArchiveConfig,
      freeze: true,
      index: true,
      type: 'duplexFields',
    },
  ],

  relationalFields: [
    {
      name: 'archives',
      oppositeName: 'original',
      config: restaurantArchiveConfig,
      parent: true,
      array: true,
      type: 'relationalFields',
    },
  ],
});

Object.assign(restaurantCloneConfig, {
  name: 'RestaurantClone',
  type: 'tangible',

  textFields: [
    {
      name: 'title',
      type: 'textFields',
    },
  ],

  duplexFields: [
    {
      name: 'original',
      oppositeName: 'clone',
      config: restaurantConfig,
      required: true, // !!!!
      unique: true,
      type: 'duplexFields',
    },

    {
      name: 'backup',
      oppositeName: 'clone',
      config: restaurantBackupConfig,
      index: true,
      type: 'duplexFields',
    },

    {
      name: 'archive',
      oppositeName: 'clone',
      config: restaurantArchiveConfig,
      type: 'duplexFields',
    },
  ],
});

Object.assign(restaurantBackupConfig, {
  name: 'RestaurantBackup',
  type: 'tangible',

  textFields: [
    {
      name: 'title',
      type: 'textFields',
    },
  ],

  duplexFields: [
    {
      name: 'original',
      oppositeName: 'backup',
      config: restaurantConfig,
      unique: true,
      type: 'duplexFields',
    },

    {
      name: 'clone',
      oppositeName: 'backup',
      config: restaurantCloneConfig,
      index: true,
      type: 'duplexFields',
    },
  ],
});

Object.assign(restaurantArchiveConfig, {
  name: 'RestaurantArchive',
  type: 'tangible',

  textFields: [
    {
      name: 'title',
      type: 'textFields',
    },
  ],

  duplexFields: [
    {
      name: 'clone',
      oppositeName: 'archive',
      config: restaurantCloneConfig,
      type: 'duplexFields',
    },

    {
      name: 'original2',
      oppositeName: 'archive', // archive2
      config: restaurantConfig,
      index: true,
      type: 'duplexFields',
    },
  ],

  relationalFields: [
    {
      name: 'original',
      oppositeName: 'archives',
      config: restaurantConfig,
      type: 'relationalFields',
    },
  ],
});

const generalConfig: GeneralConfig = {
  allEntityConfigs: {
    Parent: parentConfig,
    Child: childConfig,
    Example: exampleConfig,
    ExampleClone: exampleCloneConfig,
    Person: personConfig,
    PersonClone: personCloneConfig,
    Menu: menuConfig,
    MenuClone: menuCloneConfig,
    MenuSection: menuSectionConfig,
    MenuCloneSection: menuSectionCloneConfig,
    Restaurant: restaurantConfig,
    RestaurantArchive: restaurantArchiveConfig,
    RestaurantBackup: restaurantBackupConfig,
    RestaurantClone: restaurantCloneConfig,
  },
};

const serversideConfig = { transactions: true };

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-work-out-mutations';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  const parentSchema = createThingSchema(parentConfig);
  const Parent = mongooseConn.model('Parent_Thing', parentSchema);
  await Parent.init();
  await Parent.createCollection();

  const childSchema = createThingSchema(childConfig);
  const Child = mongooseConn.model('Child_Thing', childSchema);
  await Child.init();
  await Child.createCollection();

  const exampleSchema = createThingSchema(exampleConfig);
  const Example = mongooseConn.model('Example_Thing', exampleSchema);
  await Example.init();
  await Example.createCollection();

  const exampleCloneSchema = createThingSchema(exampleCloneConfig);
  const ExampleClone = mongooseConn.model('ExampleClone_Thing', exampleCloneSchema);
  await ExampleClone.init();
  await ExampleClone.createCollection();
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

describe('workOutMutations', () => {
  test('should create mutation delete entity resolver with wipe out duplex fields values', async () => {
    const createPerson = createCreateEntityMutationResolver(
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
    const createdParent = await createPerson(null, { data }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[]],
    });

    expect(createdParent.name).toBe(data.name);
    expect(createdParent.children.length).toBe(data.children.create.length);

    const standardMutationsArgs = [
      {
        actionGeneralName: 'deleteEntity',
        entityConfig: parentConfig,
        args: { whereOne: { id: createdParent.id } },
        returnResult: true,
      },
      {
        actionGeneralName: 'deleteManyEntities',
        entityConfig: childConfig,
        args: { whereOne: createdParent.children.map(({ id }) => ({ id })) },
        returnResult: true,
      },
    ];

    const context = { mongooseConn, pubsub };

    const commonResolverCreatorArg = { generalConfig, serversideConfig, context };

    const result = await workOutMutations(standardMutationsArgs, commonResolverCreatorArg);

    result.forEach((item) => {
      delete item.__v;
    }); // remove spare mongodb field

    expect(result[0]).toEqual(createdParent);
    expect(result[1].map(({ id }) => id)).toEqual(createdParent.children);

    const parentSchema = createThingSchema(parentConfig);
    const Parent = mongooseConn.model('Parent_Thing', parentSchema);
    await Parent.init();
    await Parent.createCollection();

    const childSchema = createThingSchema(childConfig);
    const Child = mongooseConn.model('Child_Thing', childSchema);
    await Child.init();
    await Child.createCollection();

    const findedParent = await Parent.findById(createdParent.id);
    expect(findedParent).toBe(null);
    const findedChild1 = await Child.findById(createdParent.children[0]);
    expect(findedChild1).toBe(null);
    const findedChild2 = await Child.findById(createdParent.children[1]);
    expect(findedChild2).toBe(null);
    const findedChild3 = await Child.findById(createdParent.children[2]);
    expect(findedChild3).toBe(null);
  });

  test('should create resolver for chain of 2 createEntity & 2 updateEntity', async () => {
    const context = { mongooseConn, pubsub };

    const commonResolverCreatorArg = { generalConfig, serversideConfig, context };

    const standardMutationsArgsToCreateEntity = [
      {
        actionGeneralName: 'createEntity',
        entityConfig: exampleCloneConfig,
        args: {
          data: { name: 'Name Clone' },
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'createEntity',
        entityConfig: exampleConfig,
        args: {
          data: { name: 'Name' },
        },
        returnResult: true,
      },
    ];

    const [createdExampleClone, createdExample] = await workOutMutations(
      standardMutationsArgsToCreateEntity,
      commonResolverCreatorArg,
    );

    expect(createdExampleClone.name).toBe('Name Clone');
    expect(createdExample.name).toBe('Name');

    const standardMutationsArgs = [
      {
        actionGeneralName: 'updateEntity',
        entityConfig: exampleCloneConfig,
        args: { whereOne: { id: createdExampleClone.id }, data: { name: 'Name2' } },
        returnResult: true,
      },
      {
        actionGeneralName: 'updateEntity',
        entityConfig: exampleConfig,
        args: { whereOne: { id: createdExample.id }, data: { name: null } },
        returnResult: true,
      },
      {
        actionGeneralName: 'updateEntity',
        entityConfig: exampleConfig,
        args: { whereOne: { id: createdExample.id }, data: { label: 'test' } },
        returnResult: true,
      },
      {
        actionGeneralName: 'updateEntity',
        entityConfig: exampleConfig,
        args: { whereOne: { id: createdExample.id }, data: { name: 'Name' } },
        returnResult: true,
      },
    ];

    const [result, result2] = await workOutMutations(
      standardMutationsArgs,
      commonResolverCreatorArg,
    );

    expect(result2.label).toBe('test');
    expect(result2.nameAndLabel).toBe('Name with label: "test"');
    expect(result.name).toBe('Name2');
  });

  test('should create resolver for chain of 2 createEntity & 2 pushIntoEntity', async () => {
    const context = { mongooseConn, pubsub };

    const commonResolverCreatorArg = { generalConfig, serversideConfig, context };

    const standardMutationsArgsToCreateEntity = [
      {
        actionGeneralName: 'createEntity',
        entityConfig: exampleCloneConfig,
        args: {
          data: { name: 'Name Clone', counts: [10, 30, 50] },
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'createEntity',
        entityConfig: exampleConfig,
        args: {
          data: { name: 'Name' },
        },
        returnResult: true,
      },
    ];

    const [createdExampleClone, createdExample] = await workOutMutations(
      standardMutationsArgsToCreateEntity,
      commonResolverCreatorArg,
    );

    expect(createdExampleClone.name).toBe('Name Clone');
    expect(createdExampleClone.counts).toEqual([10, 30, 50]);
    expect(createdExample.name).toBe('Name');
    expect(createdExample.counts).toEqual([]);

    const standardMutationsArgs = [
      {
        actionGeneralName: 'pushIntoEntity',
        entityConfig: exampleCloneConfig,
        args: {
          whereOne: { id: createdExampleClone.id },
          data: { counts: [0, 20, 40, 60] },
          positions: { counts: [0, 2, 4, 6] },
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'pushIntoEntity',
        entityConfig: exampleConfig,
        args: {
          whereOne: { id: createdExample.id },
          data: { counts: [99, 55] },
        },
        returnResult: true,
      },
    ];

    const [result, result2] = await workOutMutations(
      standardMutationsArgs,
      commonResolverCreatorArg,
    );

    expect(result.counts).toEqual([0, 10, 20, 30, 40, 50, 60]);
    expect(result2.counts).toEqual([99, 55]);

    const exampleCloneSchema = createThingSchema(exampleCloneConfig);
    const ExampleClone = mongooseConn.model('ExampleClone_Thing', exampleCloneSchema);
    await ExampleClone.init();
    await ExampleClone.createCollection();

    const exampleSchema = createThingSchema(exampleConfig);
    const Example = mongooseConn.model('Example_Thing', exampleSchema);
    await Example.init();
    await Example.createCollection();

    const exampleClone = await ExampleClone.findOne({ _id: createdExampleClone.id });
    const example = await Example.findOne({ _id: createdExample.id });

    expect([...exampleClone.counts]).toEqual([0, 10, 20, 30, 40, 50, 60]);
    expect([...example.counts]).toEqual([99, 55]);
  });

  test('should create resolvers for chain of 2 createMany', async () => {
    const dataToCreateExampleClones = [
      { name: 'Name Clone 0' },
      { name: 'Name Clone 1' },
      { name: 'Name Clone 2' },
      { name: 'Name Clone 3' },
      { name: 'Name Clone 4' },
    ];
    const dataToCreateExamples = [
      { name: 'Name 0' },
      { name: 'Name 1' },
      { name: 'Name 2' },
      { name: 'Name 3' },
    ];
    const standardMutationsArgsToCreateManyThings = [
      {
        actionGeneralName: 'createManyEntities',
        entityConfig: exampleCloneConfig,
        args: {
          data: dataToCreateExampleClones,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'createManyEntities',
        entityConfig: exampleConfig,
        args: {
          data: dataToCreateExamples,
        },
        returnResult: true,
      },
    ];

    const context = { mongooseConn, pubsub };

    const commonResolverCreatorArg = { generalConfig, serversideConfig, context };

    const [resultToCreateExampleClones, resultToCreateExamples] = await workOutMutations(
      standardMutationsArgsToCreateManyThings,
      commonResolverCreatorArg,
    );

    expect(resultToCreateExampleClones.map(({ name }) => ({ name }))).toEqual(
      dataToCreateExampleClones,
    );
    expect(resultToCreateExamples.map(({ name }) => ({ name }))).toEqual(dataToCreateExamples);
  });

  test('should create resolvers for chain of 2 createMany & 2 deleteMany', async () => {
    const dataToCreateExampleClones = [
      { name: 'Name Clone 0' },
      { name: 'Name Clone 1' },
      { name: 'Name Clone 2' },
      { name: 'Name Clone 3' },
      { name: 'Name Clone 4' },
    ];
    const dataToCreateExamples = [
      { name: 'Name 0' },
      { name: 'Name 1' },
      { name: 'Name 2' },
      { name: 'Name 3' },
    ];
    const standardMutationsArgsToCreateManyThings = [
      {
        actionGeneralName: 'createManyEntities',
        entityConfig: exampleCloneConfig,
        args: {
          data: dataToCreateExampleClones,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'deleteManyEntities',
        entityConfig: exampleCloneConfig,
        args: {
          whereOne: [],
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'createManyEntities',
        entityConfig: exampleConfig,
        args: {
          data: dataToCreateExamples,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'deleteManyEntities',
        entityConfig: exampleCloneConfig,
        args: {
          whereOne: [],
        },
        returnResult: true,
      },
    ];

    const context = { mongooseConn, pubsub };

    const commonResolverCreatorArg = { generalConfig, serversideConfig, context };

    const [
      resultToCreateExampleClones,
      resultEmptyDeleteExampleClones,
      resultToCreateExamples,
      resultEmptyDeleteExamples,
    ] = await workOutMutations(standardMutationsArgsToCreateManyThings, commonResolverCreatorArg);

    expect(resultToCreateExampleClones.map(({ name }) => ({ name }))).toEqual(
      dataToCreateExampleClones,
    );
    expect(resultEmptyDeleteExampleClones).toEqual([]);
    expect(resultToCreateExamples.map(({ name }) => ({ name }))).toEqual(dataToCreateExamples);
    expect(resultEmptyDeleteExamples).toEqual([]);

    const whereOneToDeleteManyExampleClones = resultToCreateExampleClones.map(({ id }) => ({ id }));

    const whereOneToDeleteManyExamples = resultToCreateExamples.map(({ id }) => ({ id }));

    const standardMutationsArgsToDeleteManyThings = [
      {
        actionGeneralName: 'deleteManyEntities',
        entityConfig: exampleCloneConfig,
        args: {
          whereOne: whereOneToDeleteManyExampleClones,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'deleteManyEntities',
        entityConfig: exampleConfig,
        args: {
          whereOne: whereOneToDeleteManyExamples,
        },
        returnResult: true,
      },
    ];

    const exampleCloneSchema = createThingSchema(exampleCloneConfig);
    const ExampleClone = mongooseConn.model('ExampleClone_Thing', exampleCloneSchema);
    await ExampleClone.init();
    await ExampleClone.createCollection();

    const exampleSchema = createThingSchema(exampleConfig);
    const Example = mongooseConn.model('Example_Thing', exampleSchema);
    await Example.init();
    await Example.createCollection();

    const exampleClonesBeforeDelete = await ExampleClone.find({});
    const examplesBeforeDelete = await Example.find({});

    const [resultToDeleteManyExampleClones, resultToDeleteManyExamples] = await workOutMutations(
      standardMutationsArgsToDeleteManyThings,
      commonResolverCreatorArg,
    );

    expect(resultToDeleteManyExampleClones.map(({ name }) => ({ name }))).toEqual(
      dataToCreateExampleClones,
    );
    expect(resultToDeleteManyExamples.map(({ name }) => ({ name }))).toEqual(dataToCreateExamples);

    const exampleClonesAfterDelete = await ExampleClone.find({});
    const examplesAfterDelete = await Example.find({});

    expect(exampleClonesAfterDelete.length).toBe(
      exampleClonesBeforeDelete.length - whereOneToDeleteManyExampleClones.length,
    );
    expect(examplesAfterDelete.length).toBe(
      examplesBeforeDelete.length - whereOneToDeleteManyExamples.length,
    );
  });

  test('should create resolvers for chain of 2 createMany & 2 deleteFiltered', async () => {
    const dataToCreateExampleClones = [
      { name: 'Name Clone 0', label: 'aaa' },
      { name: 'Name Clone 1', label: 'xxx' },
      { name: 'Name Clone 2', label: 'aaa' },
      { name: 'Name Clone 3', label: 'xxx' },
      { name: 'Name Clone 4', label: 'xxx' },
    ];
    const dataToCreateExamples = [
      { name: 'Name 0', label: 'aaa' },
      { name: 'Name 1', label: 'aaa' },
      { name: 'Name 2', label: 'xxx' },
      { name: 'Name 3', label: 'xxx' },
    ];
    const standardMutationsArgsToCreateManyThings = [
      {
        actionGeneralName: 'createManyEntities',
        entityConfig: exampleCloneConfig,
        args: {
          data: dataToCreateExampleClones,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'createManyEntities',
        entityConfig: exampleCloneConfig,
        args: {
          data: [],
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'deleteFilteredEntities',
        entityConfig: exampleCloneConfig,
        args: {
          where: { name: 'Name-is-absent' },
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'createManyEntities',
        entityConfig: exampleConfig,
        args: {
          data: dataToCreateExamples,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'createManyEntities',
        entityConfig: exampleConfig,
        args: {
          data: [],
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'deleteFilteredEntities',
        entityConfig: exampleConfig,
        args: {
          where: { name: 'Name-is-absent' },
        },
        returnResult: true,
      },
    ];

    const context = { mongooseConn, pubsub };

    const commonResolverCreatorArg = { generalConfig, serversideConfig, context };

    const [
      resultToCreateExampleClones,
      emptyResultToCreateExampleClones,
      emptyResultToDeleteExampleClones,
      resultToCreateExamples,
      emptyResultToCreateExamples,
      emptyResultToDeleteExamples,
    ] = await workOutMutations(standardMutationsArgsToCreateManyThings, commonResolverCreatorArg);

    expect(resultToCreateExampleClones.map(({ name, label }) => ({ name, label }))).toEqual(
      dataToCreateExampleClones,
    );
    expect(emptyResultToCreateExampleClones).toEqual([]);
    expect(emptyResultToDeleteExampleClones).toEqual([]);
    expect(resultToCreateExamples.map(({ name, label }) => ({ name, label }))).toEqual(
      dataToCreateExamples,
    );
    expect(emptyResultToCreateExamples).toEqual([]);
    expect(emptyResultToDeleteExamples).toEqual([]);

    const whereToDeleteExampleClones = { label: 'aaa' };
    const whereToDeleteExamples = { label: 'xxx' };

    const standardMutationsArgsToDeleteFilteredThings = [
      {
        actionGeneralName: 'deleteFilteredEntities',
        entityConfig: exampleCloneConfig,
        args: {
          where: whereToDeleteExampleClones,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'deleteFilteredEntities',
        entityConfig: exampleConfig,
        args: {
          where: whereToDeleteExamples,
        },
        returnResult: true,
      },
    ];

    const exampleCloneSchema = createThingSchema(exampleCloneConfig);
    const ExampleClone = mongooseConn.model('ExampleClone_Thing', exampleCloneSchema);
    await ExampleClone.init();
    await ExampleClone.createCollection();

    const exampleSchema = createThingSchema(exampleConfig);
    const Example = mongooseConn.model('Example_Thing', exampleSchema);
    await Example.init();
    await Example.createCollection();

    const exampleClonesBeforeDelete = await ExampleClone.find(whereToDeleteExampleClones);
    const examplesBeforeDelete = await Example.find(whereToDeleteExamples);

    const [resultToDeleteFilteredExampleClones, resultToDeleteFilteredExamples] =
      await workOutMutations(standardMutationsArgsToDeleteFilteredThings, commonResolverCreatorArg);

    expect(resultToDeleteFilteredExampleClones.map(({ name, label }) => ({ name, label }))).toEqual(
      dataToCreateExampleClones.filter(({ label }) => label === 'aaa'),
    );
    expect(resultToDeleteFilteredExamples.map(({ name, label }) => ({ name, label }))).toEqual(
      dataToCreateExamples.filter(({ label }) => label === 'xxx'),
    );

    const exampleClonesAfterDelete = await ExampleClone.find(whereToDeleteExampleClones);
    const examplesAfterDelete = await Example.find(whereToDeleteExamples);

    expect(exampleClonesAfterDelete.length).toBe(
      exampleClonesBeforeDelete.length -
        dataToCreateExampleClones.filter(({ label }) => label === 'aaa').length,
    );
    expect(examplesAfterDelete.length).toBe(
      examplesBeforeDelete.length -
        dataToCreateExamples.filter(({ label }) => label === 'xxx').length,
    );
  });

  test('should create resolvers for chain of 2 createMany & 2 updateMany', async () => {
    const dataToCreateExampleClones = [
      { name: 'Name Clone 0' },
      { name: 'Name Clone 1' },
      { name: 'Name Clone 2' },
      { name: 'Name Clone 3' },
      { name: 'Name Clone 4' },
    ];
    const dataToCreateExamples = [
      { name: 'Name 0' },
      { name: 'Name 1' },
      { name: 'Name 2' },
      { name: 'Name 3' },
    ];
    const standardMutationsArgsToCreateManyThings = [
      {
        actionGeneralName: 'createManyEntities',
        entityConfig: exampleCloneConfig,
        args: {
          data: dataToCreateExampleClones,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'updateManyEntities',
        entityConfig: exampleCloneConfig,
        args: {
          whereOne: [],
          data: [],
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'createManyEntities',
        entityConfig: exampleConfig,
        args: {
          data: dataToCreateExamples,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'updateManyEntities',
        entityConfig: exampleConfig,
        args: {
          whereOne: [],
          data: [],
        },
        returnResult: true,
      },
    ];

    const context = { mongooseConn, pubsub };

    const commonResolverCreatorArg = { generalConfig, serversideConfig, context };

    const [
      resultToCreateExampleClones,
      emptyResultToUpdateExampleClones,
      resultToCreateExamples,
      emptyResultToUpdateExamples,
    ] = await workOutMutations(standardMutationsArgsToCreateManyThings, commonResolverCreatorArg);

    expect(resultToCreateExampleClones.map(({ name }) => ({ name }))).toEqual(
      dataToCreateExampleClones,
    );
    expect(emptyResultToUpdateExampleClones).toEqual([]);
    expect(resultToCreateExamples.map(({ name }) => ({ name }))).toEqual(dataToCreateExamples);
    expect(emptyResultToUpdateExamples).toEqual([]);

    const whereOneToUpdateManyExampleClones = resultToCreateExampleClones.map(({ id }) => ({ id }));

    const whereOneToUpdateManyExamples = resultToCreateExamples.map(({ id }) => ({ id }));

    const dataToUpdateExampleClones = [
      { name: 'Name Clone updated 0' },
      { name: 'Name Clone updated 1' },
      { name: 'Name Clone updated 2' },
      { name: 'Name Clone updated 3' },
      { name: 'Name Clone updated 4' },
    ];
    const dataToUpdateExamples = [
      { name: 'Name updated 0' },
      { name: 'Name updated 1' },
      { name: 'Name updated 2' },
      { name: 'Name updated 3' },
    ];

    const standardMutationsArgsToUpdateManyThings = [
      {
        actionGeneralName: 'updateManyEntities',
        entityConfig: exampleCloneConfig,
        args: {
          whereOne: whereOneToUpdateManyExampleClones,
          data: dataToUpdateExampleClones,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'updateManyEntities',
        entityConfig: exampleConfig,
        args: {
          whereOne: whereOneToUpdateManyExamples,
          data: dataToUpdateExamples,
        },
        returnResult: true,
      },
    ];

    const [resultToUpdateManyExampleClones, resultToUpdateManyExamples] = await workOutMutations(
      standardMutationsArgsToUpdateManyThings,
      commonResolverCreatorArg,
    );

    expect(resultToUpdateManyExampleClones.map(({ name }) => ({ name }))).toEqual(
      dataToUpdateExampleClones,
    );
    expect(resultToUpdateManyExamples.map(({ name }) => ({ name }))).toEqual(dataToUpdateExamples);

    const exampleCloneSchema = createThingSchema(exampleCloneConfig);
    const ExampleClone = mongooseConn.model('ExampleClone_Thing', exampleCloneSchema);
    await ExampleClone.init();
    await ExampleClone.createCollection();

    const exampleSchema = createThingSchema(exampleConfig);
    const Example = mongooseConn.model('Example_Thing', exampleSchema);
    await Example.init();
    await Example.createCollection();

    const exampleClones = await ExampleClone.find({
      _id: { $in: whereOneToUpdateManyExampleClones.map(({ id }) => id) },
    });
    const examples = await Example.find({
      _id: { $in: whereOneToUpdateManyExamples.map(({ id }) => id) },
    });

    expect(exampleClones.map(({ name }) => ({ name }))).toEqual(dataToUpdateExampleClones);
    expect(examples.map(({ name }) => ({ name }))).toEqual(dataToUpdateExamples);
  });

  test('should create resolvers for chain of 2 createMany & 2 updateFiltered', async () => {
    const dataToCreateExampleClones = [
      { name: 'Name Clone 0', label: 'updateFiltered' },
      { name: 'Name Clone 1', label: '' },
      { name: 'Name Clone 2', label: 'updateFiltered' },
      { name: 'Name Clone 3', label: '' },
      { name: 'Name Clone 4', label: 'updateFiltered' },
    ];
    const dataToCreateExamples = [
      { name: 'Name 0', label: '' },
      { name: 'Name 1', label: 'updateFiltered2' },
      { name: 'Name 2', label: '' },
      { name: 'Name 3', label: 'updateFiltered2' },
    ];
    const standardMutationsArgsToCreateManyThings = [
      {
        actionGeneralName: 'createManyEntities',
        entityConfig: exampleCloneConfig,
        args: {
          data: dataToCreateExampleClones,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'updateFilteredEntities',
        entityConfig: exampleCloneConfig,
        args: {
          where: { name: 'Name-is-absent' },
          data: { label: 'not-to-change' },
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'createManyEntities',
        entityConfig: exampleConfig,
        args: {
          data: dataToCreateExamples,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'updateFilteredEntities',
        entityConfig: exampleConfig,
        args: {
          where: { name: 'Name-is-absent' },
          data: { label: 'not-to-change' },
        },
        returnResult: true,
      },
    ];

    const context = { mongooseConn, pubsub };

    const commonResolverCreatorArg = { generalConfig, serversideConfig, context };

    const [
      resultToCreateExampleClones,
      emptyResultToUpdateExampleClones,
      resultToCreateExamples,
      emptyResultToUpdateExamples,
    ] = await workOutMutations(standardMutationsArgsToCreateManyThings, commonResolverCreatorArg);

    expect(resultToCreateExampleClones.map(({ name, label }) => ({ name, label }))).toEqual(
      dataToCreateExampleClones,
    );
    expect(emptyResultToUpdateExampleClones).toEqual([]);
    expect(resultToCreateExamples.map(({ name, label }) => ({ name, label }))).toEqual(
      dataToCreateExamples,
    );
    expect(emptyResultToUpdateExamples).toEqual([]);

    const dataToUpdateExampleClones = { label: 'updateFiltered updated' };
    const dataToUpdateExamples = { label: 'updateFiltered updated2' };

    const standardMutationsArgsToUpdateFilteredThings = [
      {
        actionGeneralName: 'updateFilteredEntities',
        entityConfig: exampleCloneConfig,
        args: {
          where: { label: 'updateFiltered' },
          data: dataToUpdateExampleClones,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'updateFilteredEntities',
        entityConfig: exampleConfig,
        args: {
          where: { label: 'updateFiltered2' },
          data: dataToUpdateExamples,
        },
        returnResult: true,
      },
    ];

    const [resultToUpdateFilteredExampleClones, resultToUpdateFilteredExamples] =
      await workOutMutations(standardMutationsArgsToUpdateFilteredThings, commonResolverCreatorArg);

    expect(resultToUpdateFilteredExampleClones.map(({ label }) => ({ label }))).toEqual(
      dataToCreateExampleClones
        .filter(({ label }) => label === 'updateFiltered')
        .map(() => ({
          label: 'updateFiltered updated',
        })),
    );
    expect(resultToUpdateFilteredExamples.map(({ label }) => ({ label }))).toEqual(
      dataToCreateExamples
        .filter(({ label }) => label === 'updateFiltered2')
        .map(() => ({
          label: 'updateFiltered updated2',
        })),
    );

    const exampleCloneSchema = createThingSchema(exampleCloneConfig);
    const ExampleClone = mongooseConn.model('ExampleClone_Thing', exampleCloneSchema);
    await ExampleClone.init();
    await ExampleClone.createCollection();

    const exampleSchema = createThingSchema(exampleConfig);
    const Example = mongooseConn.model('Example_Thing', exampleSchema);
    await Example.init();
    await Example.createCollection();

    const exampleClones = await ExampleClone.find({ label: 'updateFiltered updated' });
    const examples = await Example.find({ label: 'updateFiltered updated2' });

    expect(exampleClones.map(({ name }) => ({ name }))).toEqual(
      resultToUpdateFilteredExampleClones.map(({ name }) => ({ name })),
    );

    expect(examples.map(({ name }) => ({ name }))).toEqual(
      resultToUpdateFilteredExamples.map(({ name }) => ({ name })),
    );
  });

  test('should create resolvers for chain of 1 copyEntity', async () => {
    const personSchema = createThingSchema(personConfig);
    const Person = mongooseConn.model('Person_Thing', personSchema);
    await Person.init();
    await Person.createCollection();

    const personCloneSchema = createThingSchema(personCloneConfig);
    const PersonClone = mongooseConn.model('PersonClone_Thing', personCloneSchema);
    await PersonClone.init();
    await PersonClone.createCollection();

    const createPerson = createCreateEntityMutationResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createPerson).toBe('function');
    if (!createPerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = { firstName: 'Hugo', lastName: 'Boss' };

    const createdPerson = await createPerson(null, { data }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[]],
    });
    expect(createdPerson.firstName).toBe(data.firstName);
    expect(createdPerson.lastName).toBe(data.lastName);

    const standardMutationsArg = {
      actionGeneralName: 'copyEntity',
      entityConfig: personCloneConfig,
      args: {
        whereOnes: { original: { id: createdPerson.id } },
      },
      returnResult: true,
    };

    const lockedData = { args: { whereOne: { original: createdPerson.id } }, result: null };

    const context = { mongooseConn, pubsub };

    const commonResolverCreatorArg = { generalConfig, serversideConfig, context };

    const [personClone] = await workOutMutations(
      [{ ...standardMutationsArg, lockedData }],
      commonResolverCreatorArg,
    );

    expect(personClone.firstName).toBe(data.firstName);
    expect(personClone.lastName).toBe(data.lastName);
    expect(personClone.original.toString()).toBe(createdPerson.id.toString());

    const dataToUpdate = { firstName: 'Hugo2', lastName: 'Boss2' };

    const standardMutationsArgsToUpdateEntity = [
      {
        actionGeneralName: 'updateEntity',
        entityConfig: personConfig,
        args: {
          whereOne: { id: createdPerson.id },
          data: dataToUpdate,
        },
        returnResult: true,
      },
    ];

    await workOutMutations(standardMutationsArgsToUpdateEntity, commonResolverCreatorArg);

    const lockedData2 = {
      args: { whereOne: { original: createdPerson.id } },
      result: { original: createdPerson.id },
    };

    const [personClone2] = await workOutMutations(
      [{ ...standardMutationsArg, lockedData: lockedData2 }],
      commonResolverCreatorArg,
    );

    expect(personClone2.firstName).toBe(dataToUpdate.firstName);
    expect(personClone2.lastName).toBe(dataToUpdate.lastName);
    expect(personClone2.original.toString()).toBe(createdPerson.id.toString());
  });

  test('should create resolvers for chain of 1 copyEntityWithChildren', async () => {
    const menuSchema = createThingSchema(menuConfig);
    const Menu = mongooseConn.model('Menu_Thing', menuSchema);
    await Menu.init();
    await Menu.createCollection();

    const menuSectionSchema = createThingSchema(menuSectionConfig);
    const MenuSection = mongooseConn.model('MenuSection_Thing', menuSectionSchema);
    await MenuSection.init();
    await MenuSection.createCollection();

    const menuCloneSchema = createThingSchema(menuCloneConfig);
    const MenuClone = mongooseConn.model('MenuClone_Thing', menuCloneSchema);
    await MenuClone.init();
    await MenuClone.createCollection();

    const menuCloneSectionSchema = createThingSchema(menuSectionCloneConfig);
    const MenuCloneSection = mongooseConn.model('MenuCloneSection_Thing', menuCloneSectionSchema);
    await MenuCloneSection.init();
    await MenuCloneSection.createCollection();

    const createMenu = createCreateEntityMutationResolver(
      menuConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createMenu).toBe('function');
    if (!createMenu) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      name: 'Menu Name',
      sections: {
        create: [
          {
            name: 'Section Name 1',
          },
          {
            name: 'Section Name 2',
          },
          {
            name: 'Section Name 3',
          },
        ],
      },
    };
    const createdMenu = await createMenu(null, { data }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[]],
    });
    expect(createdMenu.name).toBe(data.name);
    expect(createdMenu.sections.length).toBe(data.sections.create.length);

    const standardMutationsArgsToCopyEntityWithChildren = [
      {
        actionGeneralName: 'copyEntityWithChildren',
        entityConfig: menuCloneConfig,
        args: {
          whereOnes: { original: { id: createdMenu.id } },
        },
        returnResult: true,
      },
    ];

    const context = { mongooseConn, pubsub };

    const commonResolverCreatorArg = { generalConfig, serversideConfig, context };

    const [menuClone] = await workOutMutations(
      standardMutationsArgsToCopyEntityWithChildren,
      commonResolverCreatorArg,
    );

    expect(menuClone.name).toBe(data.name);
    expect(menuClone.sections.length).toBe(data.sections.create.length);
    expect(menuClone.original.toString()).toBe(createdMenu.id.toString());

    const dataToUpdate = { name: 'Menu Updated Name' };

    const standardMutationsArgsToUpdateEntity = [
      {
        actionGeneralName: 'updateEntity',
        entityConfig: menuConfig,
        args: {
          whereOne: { id: createdMenu.id },
          data: dataToUpdate,
        },
        returnResult: false,
      },
    ];

    await workOutMutations(standardMutationsArgsToUpdateEntity, commonResolverCreatorArg);

    const [menuClone2] = await workOutMutations(
      standardMutationsArgsToCopyEntityWithChildren,
      commonResolverCreatorArg,
    );

    expect(menuClone2.name).toBe(dataToUpdate.name);
    expect(menuClone2.sections.length).toBe(data.sections.create.length);
    expect(menuClone.original.toString()).toBe(createdMenu.id.toString());
  });

  test('should create resolvers for chain of 1 copyManyEntities', async () => {
    const createPerson = createCreateEntityMutationResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createPerson).toBe('function');
    if (!createPerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = { firstName: 'Vasy', lastName: 'Pupkin' };

    const createdPerson = await createPerson(null, { data }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[]],
    });
    expect(createdPerson.firstName).toBe(data.firstName);
    expect(createdPerson.lastName).toBe(data.lastName);

    const standardMutationsArgsToCopyManyEntities = [
      {
        actionGeneralName: 'copyManyEntities',
        entityConfig: personCloneConfig,
        args: {
          whereOnes: [{ original: { id: createdPerson.id } }],
        },
        returnResult: true,
      },
    ];

    const context = { mongooseConn, pubsub };

    const commonResolverCreatorArg = { generalConfig, serversideConfig, context };

    const [personClones] = await workOutMutations(
      standardMutationsArgsToCopyManyEntities,
      commonResolverCreatorArg,
    );

    const [personClone] = personClones;

    expect(personClone.firstName).toBe(data.firstName);
    expect(personClone.lastName).toBe(data.lastName);
    expect(personClone.original.toString()).toBe(createdPerson.id.toString());

    const dataToUpdate = { firstName: 'Hugo2', lastName: 'Boss2' };

    const standardMutationsArgsToUpdateEntity = [
      {
        actionGeneralName: 'updateEntity',
        entityConfig: personConfig,
        args: {
          whereOne: { id: createdPerson.id },
          data: dataToUpdate,
        },
        returnResult: true,
      },
    ];

    await workOutMutations(standardMutationsArgsToUpdateEntity, commonResolverCreatorArg);

    const [personClones2] = await workOutMutations(
      standardMutationsArgsToCopyManyEntities,
      commonResolverCreatorArg,
    );

    const [personClone2] = personClones2;

    expect(personClone2.firstName).toBe(dataToUpdate.firstName);
    expect(personClone2.lastName).toBe(dataToUpdate.lastName);
    expect(personClone2.original.toString()).toBe(createdPerson.id.toString());
  });

  test('should create resolvers for chain of 1 copyManyEntitiesWithChildren', async () => {
    const createMenu = createCreateEntityMutationResolver(
      menuConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createMenu).toBe('function');
    if (!createMenu) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      name: 'Menu Name2',
      sections: {
        create: [
          {
            name: 'Section Name 1',
          },
          {
            name: 'Section Name 2',
          },
          {
            name: 'Section Name 3',
          },
        ],
      },
    };
    const createdMenu = await createMenu(null, { data }, { mongooseConn, pubsub }, null, {
      inputOutputEntity: [[]],
    });
    expect(createdMenu.name).toBe(data.name);
    expect(createdMenu.sections.length).toBe(data.sections.create.length);

    const standardMutationsArgsToCopyManyThingsWithChildren = [
      {
        actionGeneralName: 'copyManyEntitiesWithChildren',
        entityConfig: menuCloneConfig,
        args: {
          whereOnes: [{ original: { id: createdMenu.id } }],
        },
        returnResult: true,
      },
    ];

    const context = { mongooseConn, pubsub };

    const commonResolverCreatorArg = { generalConfig, serversideConfig, context };

    const [menuClones] = await workOutMutations(
      standardMutationsArgsToCopyManyThingsWithChildren,
      commonResolverCreatorArg,
    );

    const [menuClone] = menuClones;

    expect(menuClone.name).toBe(data.name);
    expect(menuClone.sections.length).toBe(data.sections.create.length);
    expect(menuClone.original.toString()).toBe(createdMenu.id.toString());

    const dataToUpdate = { name: 'Menu Updated Name2' };

    const standardMutationsArgsToUpdateEntity = [
      {
        actionGeneralName: 'updateEntity',
        entityConfig: menuConfig,
        args: {
          whereOne: { id: createdMenu.id },
          data: dataToUpdate,
        },
        returnResult: false,
      },
    ];

    await workOutMutations(standardMutationsArgsToUpdateEntity, commonResolverCreatorArg);

    const [menuClones2] = await workOutMutations(
      standardMutationsArgsToCopyManyThingsWithChildren,
      commonResolverCreatorArg,
    );

    const [menuClone2] = menuClones2;

    expect(menuClone2.name).toBe(dataToUpdate.name);
    expect(menuClone2.sections.length).toBe(data.sections.create.length);
    expect(menuClone.original.toString()).toBe(createdMenu.id.toString());
  });

  test('regression test: workout copy', async () => {
    const restaurantSchema = createThingSchema(restaurantConfig);
    const Restaurant = mongooseConn.model('Restaurant_Thing', restaurantSchema);
    await Restaurant.init();
    await Restaurant.createCollection();

    const restaurantArchiveSchema = createThingSchema(restaurantArchiveConfig);
    const RestaurantArchive = mongooseConn.model(
      'RestaurantArchive_Thing',
      restaurantArchiveSchema,
    );
    await RestaurantArchive.init();
    await RestaurantArchive.createCollection();

    const restaurantCloneSchema = createThingSchema(restaurantCloneConfig);
    const RestaurantClone = mongooseConn.model('RestaurantClone_Thing', restaurantCloneSchema);
    await RestaurantClone.init();
    await RestaurantClone.createCollection();

    const restaurantBackupSchema = createThingSchema(restaurantBackupConfig);
    const RestaurantBackup = mongooseConn.model('RestaurantBackup_Thing', restaurantBackupSchema);
    await RestaurantBackup.init();
    await RestaurantBackup.createCollection();

    const createRestaurant = createCreateEntityMutationResolver(
      restaurantConfig,
      generalConfig,
      serversideConfig,
    );

    expect(typeof createRestaurant).toBe('function');
    if (!createRestaurant) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const dataClone = { title: 'updated Flamber' };
    const data = { title: 'Flamber', clone: { create: dataClone } };

    const createdRestaurant = await createRestaurant(
      null,
      { data },
      { mongooseConn, pubsub },
      null,
      {
        inputOutputEntity: [[]],
      },
    );

    const { clone, id } = createdRestaurant;

    expect(createdRestaurant.title).toBe(data.title);

    // *********

    // const copyRestaurant = createCopyEntityMutationResolver(
    //   restaurantConfig,
    //   generalConfig,
    //   serversideConfig,
    // );
    // expect(typeof copyRestaurant).toBe('function');
    // if (!copyRestaurant) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    // const copyedRestaurant = await copyRestaurant(
    //   null,
    //   {
    //     whereOnes: { clone: { id: clone } },
    //     options: { clone: { fieldsForbiddenToCopy: ['archive', 'backup'] } },
    //   },
    //   { mongooseConn, pubsub },
    //   null,
    //   { inputOutputEntity: [[]] },
    // );

    // console.log('copyedRestaurant =', copyedRestaurant);

    // *********

    const standardMutationsArgsToCopyThing = [
      {
        actionGeneralName: 'copyEntity',
        entityConfig: restaurantConfig,
        args: {
          whereOnes: { clone: { id: clone } },
          options: { clone: { fieldsForbiddenToCopy: ['archive', 'backup'] } },
        },
        returnResult: true,
        info: { projection: { _id: 1, title: 1 }, fieldArgs: {}, path: [] },
        inAnyCase: true,
        involvedFilters: { inputOutputEntity: [[]] },
      },

      {
        actionGeneralName: 'copyEntity',
        entityConfig: restaurantBackupConfig,
        args: {
          whereOnes: { original: { id } },
          options: { original: { fieldsForbiddenToCopy: ['clone'] } },
        },
        returnResult: true,
        info: { projection: { _id: 1 }, fieldArgs: {}, path: [] },
        inAnyCase: true,
        involvedFilters: { inputOutputEntity: [[]] },
      },

      {
        actionGeneralName: 'copyEntity',
        entityConfig: restaurantArchiveConfig,
        args: {
          whereOnes: { clone: { id: clone } },
          options: { clone: { fieldsForbiddenToCopy: ['original'] } },
          data: {
            original: { connect: id },
          },
        },
        returnResult: true,
        info: { projection: { _id: 1, title: 1 }, fieldArgs: {}, path: [] },
        inAnyCase: true,
        involvedFilters: { inputOutputEntity: [[]] },
      },
    ];

    const context = { mongooseConn, pubsub };

    const commonResolverCreatorArg = { generalConfig, serversideConfig, context };

    const result = await workOutMutations(
      standardMutationsArgsToCopyThing as any,
      commonResolverCreatorArg,
    );

    const [originalRestaurant, backupRestaurant, archiveRestaurant] = result;

    const { id: backup } = backupRestaurant;

    expect(originalRestaurant.title).toBe(dataClone.title);
    expect(archiveRestaurant.title).toBe(dataClone.title);

    const { id: archive } = archiveRestaurant;

    const standardMutationsArgsToCopyThing2 = [
      {
        actionGeneralName: 'updateEntity',
        entityConfig: restaurantCloneConfig,
        args: { whereOne: { original: id }, data: { archive: { connect: null } } },
        returnResult: false,
        info: { projection: { _id: 1 }, fieldArgs: {}, path: [] },
        inAnyCase: true,
        involvedFilters: { inputOutputEntity: [[]] },
      },
    ];

    await workOutMutations(standardMutationsArgsToCopyThing2 as any, commonResolverCreatorArg);

    await workOutMutations(standardMutationsArgsToCopyThing as any, commonResolverCreatorArg);

    {
      const standardMutationsArgs = [
        {
          actionGeneralName: 'updateEntity',
          entityConfig: restaurantConfig,
          args: { whereOne: { id }, data: { archive: { connect: archive } } },
          returnResult: true,
          info: { projection: { _id: 1, clone: 1, archive: 1 }, fieldArgs: {}, path: [] },
          inAnyCase: true,
          involvedFilters: { inputOutputEntity: [[]] },
        },
      ] as any[];

      if (clone) {
        standardMutationsArgs.push({
          actionGeneralName: 'updateEntity',
          entityConfig: restaurantCloneConfig,
          args: { whereOne: { id: clone }, data: { archive: { connect: archive } } },
          returnResult: true,
          info: { projection: { _id: 1, original: 1, archive: 1 }, fieldArgs: {}, path: [] },
          inAnyCase: true,
          involvedFilters: { inputOutputEntity: [[]] },
        });
      }

      const [originalInstance, cloneInstance] = await workOutMutations(
        standardMutationsArgs as any,
        commonResolverCreatorArg as any,
      );
    }

    {
      const standardMutationsArgs = [
        {
          actionGeneralName: 'copyEntity',
          entityConfig: restaurantConfig,
          args: {
            whereOnes: { archive: { id: archive } },
            options: { archive: { fieldsForbiddenToCopy: ['clone'] } },
          },
          returnResult: true,
          info: { projection: { _id: 1 }, fieldArgs: {}, path: [] },
          inAnyCase: true,
          involvedFilters: { inputOutputEntity: [[]] },
        },
      ] as any[];

      if (clone) {
        standardMutationsArgs.push({
          actionGeneralName: 'copyEntity',
          entityConfig: restaurantCloneConfig,
          args: {
            whereOnes: { archive: { id: archive } },
            options: { archive: { fieldsForbiddenToCopy: ['original'] } },
          },
          returnResult: false,
          info: { projection: { _id: 1 }, fieldArgs: {}, path: [] },
          inAnyCase: true,
          involvedFilters: { inputOutputEntity: [[]] },
        });
      }

      if (backup) {
        standardMutationsArgs.push({
          actionGeneralName: 'copyEntity',
          entityConfig: restaurantBackupConfig,
          args: {
            whereOnes: { original: { id } },
            options: { original: { fieldsForbiddenToCopy: ['clone'] } },
          },
          returnResult: false,
          info: { projection: { _id: 1 }, fieldArgs: {}, path: [] },
          inAnyCase: true,
          involvedFilters: { inputOutputEntity: [[]] },
        });
      }

      const core = new Map();

      core.set(restaurantConfig, [
        {
          updateMany: {
            filter: {},
            update: { $push: { comments: 'test-comment' } },
          },
        },
      ]);

      const preparedBulkData = { core, periphery: new Map(), mains: [] };

      await workOutMutations(
        standardMutationsArgs as any,
        commonResolverCreatorArg as any,
        preparedBulkData as any,
      );
    }
  });
});
