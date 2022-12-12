// @flow
/* eslint-env jest */
import type { GeneralConfig, EntityConfig } from '../../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../../test/mongo-options');
const { default: createThingSchema } = require('../../../mongooseModels/createThingSchema');
const {
  default: createCreateEntityMutationResolver,
} = require('../createCreateEntityMutationResolver');
const { default: workOutMutations } = require('./index');

let mongooseConn;
let pubsub;

const exampleConfig: EntityConfig = {
  name: 'Example',
  type: 'tangible',

  textFields: [{ name: 'name', required: true }, { name: 'label' }],
  intFields: [{ name: 'counts', array: true }],
};

const exampleCloneConfig: EntityConfig = {
  name: 'ExampleClone',
  type: 'tangible',

  textFields: [{ name: 'name' }, { name: 'label' }],
  intFields: [{ name: 'counts', array: true }],
};

const childConfig: EntityConfig = {};
const personConfig: EntityConfig = {};
const personCloneConfig: EntityConfig = {};
const menuConfig: EntityConfig = {};
const menuCloneConfig: EntityConfig = {};
const menuSectionConfig: EntityConfig = {};
const menuSectionCloneConfig: EntityConfig = {};
const parentConfig: EntityConfig = {
  name: 'Parent',
  type: 'tangible',
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
  type: 'tangible',
  textFields: [{ name: 'name' }],
  duplexFields: [
    {
      name: 'parent',
      oppositeName: 'children',
      config: parentConfig,
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
    },
    {
      name: 'lastName',
    },
  ],
  duplexFields: [
    {
      name: 'clone',
      oppositeName: 'original',
      config: personCloneConfig,
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
    },

    {
      name: 'lastName',
    },
  ],

  duplexFields: [
    {
      name: 'original',
      oppositeName: 'clone',
      config: personConfig,
      required: true,
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
    },
  ],

  duplexFields: [
    {
      name: 'clone',
      oppositeName: 'original',
      config: menuCloneConfig,
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
    },
  ],

  duplexFields: [
    {
      name: 'original',
      oppositeName: 'clone',
      config: menuConfig,
      required: true,
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
    },
  ],

  duplexFields: [
    {
      name: 'menu',
      oppositeName: 'sections',
      config: menuConfig,
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
    },
  ],

  duplexFields: [
    {
      name: 'menu',
      oppositeName: 'sections',
      config: menuCloneConfig,
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
  },
};

const serversideConfig = { transactions: true };

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-work-out-mutations';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  pubsub = new PubSub();

  const parentSchema = createThingSchema(parentConfig);
  const Parent = mongooseConn.model('Parent_Thing', parentSchema);
  await Parent.createCollection();

  const childSchema = createThingSchema(childConfig);
  const Child = mongooseConn.model('Child_Thing', childSchema);
  await Child.createCollection();

  const exampleSchema = createThingSchema(exampleConfig);
  const Example = mongooseConn.model('Example_Thing', exampleSchema);
  await Example.createCollection();

  const exampleCloneSchema = createThingSchema(exampleCloneConfig);
  const ExampleClone = mongooseConn.model('ExampleClone_Thing', exampleCloneSchema);
  await ExampleClone.createCollection();
});

afterAll(async () => {
  mongooseConn.connection.close();
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
    const createdParent = await createPerson(null, { data }, { mongooseConn, pubsub });

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

    expect(result[0]).toEqual(createdParent);
    expect(result[1].map(({ id }) => id)).toEqual(createdParent.children);

    const parentSchema = createThingSchema(parentConfig);
    const Parent = mongooseConn.model('Parent_Thing', parentSchema);

    const childSchema = createThingSchema(childConfig);
    const Child = mongooseConn.model('Child_Thing', childSchema);

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

    const exampleSchema = createThingSchema(exampleConfig);
    const Example = mongooseConn.model('Example_Thing', exampleSchema);

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

    const exampleSchema = createThingSchema(exampleConfig);
    const Example = mongooseConn.model('Example_Thing', exampleSchema);

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

    const exampleSchema = createThingSchema(exampleConfig);
    const Example = mongooseConn.model('Example_Thing', exampleSchema);

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

    const exampleSchema = createThingSchema(exampleConfig);
    const Example = mongooseConn.model('Example_Thing', exampleSchema);

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

    const exampleSchema = createThingSchema(exampleConfig);
    const Example = mongooseConn.model('Example_Thing', exampleSchema);

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
    await Person.createCollection();

    const personCloneSchema = createThingSchema(personCloneConfig);
    const PersonClone = mongooseConn.model('PersonClone_Thing', personCloneSchema);
    await PersonClone.createCollection();

    const createPerson = createCreateEntityMutationResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    expect(typeof createPerson).toBe('function');
    if (!createPerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = { firstName: 'Hugo', lastName: 'Boss' };

    const createdPerson = await createPerson(null, { data }, { mongooseConn, pubsub });
    expect(createdPerson.firstName).toBe(data.firstName);
    expect(createdPerson.lastName).toBe(data.lastName);

    const standardMutationsArgsToCopyThing = [
      {
        actionGeneralName: 'copyEntity',
        entityConfig: personCloneConfig,
        args: {
          whereOnes: { original: { id: createdPerson.id } },
        },
        returnResult: true,
      },
    ];

    const context = { mongooseConn, pubsub };

    const commonResolverCreatorArg = { generalConfig, serversideConfig, context };

    const [personClone] = await workOutMutations(
      standardMutationsArgsToCopyThing,
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

    const [personClone2] = await workOutMutations(
      standardMutationsArgsToCopyThing,
      commonResolverCreatorArg,
    );

    expect(personClone2.firstName).toBe(dataToUpdate.firstName);
    expect(personClone2.lastName).toBe(dataToUpdate.lastName);
    expect(personClone2.original.toString()).toBe(createdPerson.id.toString());
  });

  test('should create resolvers for chain of 1 copyEntityWithChildren', async () => {
    const menuSchema = createThingSchema(menuConfig);
    const Menu = mongooseConn.model('Menu_Thing', menuSchema);
    await Menu.createCollection();

    const menuSectionSchema = createThingSchema(menuSectionConfig);
    const MenuSection = mongooseConn.model('MenuSection_Thing', menuSectionSchema);
    await MenuSection.createCollection();

    const menuCloneSchema = createThingSchema(menuCloneConfig);
    const MenuClone = mongooseConn.model('MenuClone_Thing', menuCloneSchema);
    await MenuClone.createCollection();

    const menuCloneSectionSchema = createThingSchema(menuSectionCloneConfig);
    const MenuCloneSection = mongooseConn.model('MenuCloneSection_Thing', menuCloneSectionSchema);
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
    const createdMenu = await createMenu(null, { data }, { mongooseConn, pubsub });
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

    const createdPerson = await createPerson(null, { data }, { mongooseConn, pubsub });
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
    const createdMenu = await createMenu(null, { data }, { mongooseConn, pubsub });
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
});
