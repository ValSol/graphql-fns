// @flow
/* eslint-env jest */
import type { GeneralConfig, ThingConfig } from '../../../flowTypes';

const mongoose = require('mongoose');
const { PubSub } = require('graphql-subscriptions');

const mongoOptions = require('../../../../test/mongo-options');
const { default: createThingSchema } = require('../../../mongooseModels/createThingSchema');
const {
  default: createCreateThingMutationResolver,
} = require('../createCreateThingMutationResolver');
const { default: workOutMutations } = require('./index');

let mongooseConn;
let pubsub;

const exampleConfig: ThingConfig = {
  name: 'Example',

  textFields: [{ name: 'name', required: true }, { name: 'label' }],
  intFields: [{ name: 'counts', array: true }],
};

const exampleCloneConfig: ThingConfig = {
  name: 'ExampleClone',

  textFields: [{ name: 'name' }, { name: 'label' }],
  intFields: [{ name: 'counts', array: true }],
};

const childConfig: ThingConfig = {};
const personConfig: ThingConfig = {};
const personCloneConfig: ThingConfig = {};
const menuConfig: ThingConfig = {};
const menuCloneConfig: ThingConfig = {};
const menuSectionConfig: ThingConfig = {};
const menuSectionCloneConfig: ThingConfig = {};
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

Object.assign(personConfig, {
  name: 'Person',
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
  thingConfigs: {
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
  test('should create mutation delete thing resolver with wipe out duplex fields values', async () => {
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

  test('should create resolver for chain of 2 createThing & 2 updateThing', async () => {
    const context = { mongooseConn, pubsub };

    const commonResolverCreatorArg = { generalConfig, serversideConfig, context };

    const standardMutationsArgsToCreateThing = [
      {
        actionGeneralName: 'createThing',
        thingConfig: exampleCloneConfig,
        args: {
          data: { name: 'Name Clone' },
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'createThing',
        thingConfig: exampleConfig,
        args: {
          data: { name: 'Name' },
        },
        returnResult: true,
      },
    ];

    const [createdExampleClone, createdExample] = await workOutMutations(
      standardMutationsArgsToCreateThing,
      commonResolverCreatorArg,
    );

    expect(createdExampleClone.name).toBe('Name Clone');
    expect(createdExample.name).toBe('Name');

    const standardMutationsArgs = [
      {
        actionGeneralName: 'updateThing',
        thingConfig: exampleCloneConfig,
        args: { whereOne: { id: createdExampleClone.id }, data: { name: 'Name2' } },
        returnResult: true,
      },
      {
        actionGeneralName: 'updateThing',
        thingConfig: exampleConfig,
        args: { whereOne: { id: createdExample.id }, data: { name: null } },
        returnResult: true,
      },
      {
        actionGeneralName: 'updateThing',
        thingConfig: exampleConfig,
        args: { whereOne: { id: createdExample.id }, data: { label: 'test' } },
        returnResult: true,
      },
      {
        actionGeneralName: 'updateThing',
        thingConfig: exampleConfig,
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

  test('should create resolver for chain of 2 createThing & 2 pushIntoThing', async () => {
    const context = { mongooseConn, pubsub };

    const commonResolverCreatorArg = { generalConfig, serversideConfig, context };

    const standardMutationsArgsToCreateThing = [
      {
        actionGeneralName: 'createThing',
        thingConfig: exampleCloneConfig,
        args: {
          data: { name: 'Name Clone', counts: [10, 30, 50] },
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'createThing',
        thingConfig: exampleConfig,
        args: {
          data: { name: 'Name' },
        },
        returnResult: true,
      },
    ];

    const [createdExampleClone, createdExample] = await workOutMutations(
      standardMutationsArgsToCreateThing,
      commonResolverCreatorArg,
    );

    expect(createdExampleClone.name).toBe('Name Clone');
    expect(createdExampleClone.counts).toEqual([10, 30, 50]);
    expect(createdExample.name).toBe('Name');
    expect(createdExample.counts).toEqual([]);

    const standardMutationsArgs = [
      {
        actionGeneralName: 'pushIntoThing',
        thingConfig: exampleCloneConfig,
        args: {
          whereOne: { id: createdExampleClone.id },
          data: { counts: [0, 20, 40, 60] },
          positions: { counts: [0, 2, 4, 6] },
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'pushIntoThing',
        thingConfig: exampleConfig,
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
        actionGeneralName: 'createManyThings',
        thingConfig: exampleCloneConfig,
        args: {
          data: dataToCreateExampleClones,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'createManyThings',
        thingConfig: exampleConfig,
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
        actionGeneralName: 'createManyThings',
        thingConfig: exampleCloneConfig,
        args: {
          data: dataToCreateExampleClones,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'deleteManyThings',
        thingConfig: exampleCloneConfig,
        args: {
          whereOne: [],
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'createManyThings',
        thingConfig: exampleConfig,
        args: {
          data: dataToCreateExamples,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'deleteManyThings',
        thingConfig: exampleCloneConfig,
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
        actionGeneralName: 'deleteManyThings',
        thingConfig: exampleCloneConfig,
        args: {
          whereOne: whereOneToDeleteManyExampleClones,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'deleteManyThings',
        thingConfig: exampleConfig,
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
        actionGeneralName: 'createManyThings',
        thingConfig: exampleCloneConfig,
        args: {
          data: dataToCreateExampleClones,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'createManyThings',
        thingConfig: exampleCloneConfig,
        args: {
          data: [],
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'deleteFilteredThings',
        thingConfig: exampleCloneConfig,
        args: {
          where: { name: 'Name-is-absent' },
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'createManyThings',
        thingConfig: exampleConfig,
        args: {
          data: dataToCreateExamples,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'createManyThings',
        thingConfig: exampleConfig,
        args: {
          data: [],
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'deleteFilteredThings',
        thingConfig: exampleConfig,
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
        actionGeneralName: 'deleteFilteredThings',
        thingConfig: exampleCloneConfig,
        args: {
          where: whereToDeleteExampleClones,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'deleteFilteredThings',
        thingConfig: exampleConfig,
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
        actionGeneralName: 'createManyThings',
        thingConfig: exampleCloneConfig,
        args: {
          data: dataToCreateExampleClones,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'updateManyThings',
        thingConfig: exampleCloneConfig,
        args: {
          whereOne: [],
          data: [],
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'createManyThings',
        thingConfig: exampleConfig,
        args: {
          data: dataToCreateExamples,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'updateManyThings',
        thingConfig: exampleConfig,
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
        actionGeneralName: 'updateManyThings',
        thingConfig: exampleCloneConfig,
        args: {
          whereOne: whereOneToUpdateManyExampleClones,
          data: dataToUpdateExampleClones,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'updateManyThings',
        thingConfig: exampleConfig,
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
        actionGeneralName: 'createManyThings',
        thingConfig: exampleCloneConfig,
        args: {
          data: dataToCreateExampleClones,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'updateFilteredThings',
        thingConfig: exampleCloneConfig,
        args: {
          where: { name: 'Name-is-absent' },
          data: { label: 'not-to-change' },
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'createManyThings',
        thingConfig: exampleConfig,
        args: {
          data: dataToCreateExamples,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'updateFilteredThings',
        thingConfig: exampleConfig,
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
        actionGeneralName: 'updateFilteredThings',
        thingConfig: exampleCloneConfig,
        args: {
          where: { label: 'updateFiltered' },
          data: dataToUpdateExampleClones,
        },
        returnResult: true,
      },
      {
        actionGeneralName: 'updateFilteredThings',
        thingConfig: exampleConfig,
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

  test('should create resolvers for chain of 1 copyThing', async () => {
    const personSchema = createThingSchema(personConfig);
    const Person = mongooseConn.model('Person_Thing', personSchema);
    await Person.createCollection();

    const personCloneSchema = createThingSchema(personCloneConfig);
    const PersonClone = mongooseConn.model('PersonClone_Thing', personCloneSchema);
    await PersonClone.createCollection();

    const createPerson = createCreateThingMutationResolver(
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
        actionGeneralName: 'copyThing',
        thingConfig: personCloneConfig,
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

    const standardMutationsArgsToUpdateThing = [
      {
        actionGeneralName: 'updateThing',
        thingConfig: personConfig,
        args: {
          whereOne: { id: createdPerson.id },
          data: dataToUpdate,
        },
        returnResult: true,
      },
    ];

    await workOutMutations(standardMutationsArgsToUpdateThing, commonResolverCreatorArg);

    const [personClone2] = await workOutMutations(
      standardMutationsArgsToCopyThing,
      commonResolverCreatorArg,
    );

    expect(personClone2.firstName).toBe(dataToUpdate.firstName);
    expect(personClone2.lastName).toBe(dataToUpdate.lastName);
    expect(personClone2.original.toString()).toBe(createdPerson.id.toString());
  });

  test('should create resolvers for chain of 1 copyThingWithChildren', async () => {
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

    const createMenu = createCreateThingMutationResolver(
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

    const standardMutationsArgsToCopyThingWithChildren = [
      {
        actionGeneralName: 'copyThingWithChildren',
        thingConfig: menuCloneConfig,
        args: {
          whereOnes: { original: { id: createdMenu.id } },
        },
        returnResult: true,
      },
    ];

    const context = { mongooseConn, pubsub };

    const commonResolverCreatorArg = { generalConfig, serversideConfig, context };

    const [menuClone] = await workOutMutations(
      standardMutationsArgsToCopyThingWithChildren,
      commonResolverCreatorArg,
    );

    expect(menuClone.name).toBe(data.name);
    expect(menuClone.sections.length).toBe(data.sections.create.length);
    expect(menuClone.original.toString()).toBe(createdMenu.id.toString());

    const dataToUpdate = { name: 'Menu Updated Name' };

    const standardMutationsArgsToUpdateThing = [
      {
        actionGeneralName: 'updateThing',
        thingConfig: menuConfig,
        args: {
          whereOne: { id: createdMenu.id },
          data: dataToUpdate,
        },
        returnResult: false,
      },
    ];

    await workOutMutations(standardMutationsArgsToUpdateThing, commonResolverCreatorArg);

    const [menuClone2] = await workOutMutations(
      standardMutationsArgsToCopyThingWithChildren,
      commonResolverCreatorArg,
    );

    expect(menuClone2.name).toBe(dataToUpdate.name);
    expect(menuClone2.sections.length).toBe(data.sections.create.length);
    expect(menuClone.original.toString()).toBe(createdMenu.id.toString());
  });

  test('should create resolvers for chain of 1 copyManyThings', async () => {
    const createPerson = createCreateThingMutationResolver(
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

    const standardMutationsArgsToCopyManyThings = [
      {
        actionGeneralName: 'copyManyThings',
        thingConfig: personCloneConfig,
        args: {
          whereOnes: [{ original: { id: createdPerson.id } }],
        },
        returnResult: true,
      },
    ];

    const context = { mongooseConn, pubsub };

    const commonResolverCreatorArg = { generalConfig, serversideConfig, context };

    const [personClones] = await workOutMutations(
      standardMutationsArgsToCopyManyThings,
      commonResolverCreatorArg,
    );

    const [personClone] = personClones;

    expect(personClone.firstName).toBe(data.firstName);
    expect(personClone.lastName).toBe(data.lastName);
    expect(personClone.original.toString()).toBe(createdPerson.id.toString());

    const dataToUpdate = { firstName: 'Hugo2', lastName: 'Boss2' };

    const standardMutationsArgsToUpdateThing = [
      {
        actionGeneralName: 'updateThing',
        thingConfig: personConfig,
        args: {
          whereOne: { id: createdPerson.id },
          data: dataToUpdate,
        },
        returnResult: true,
      },
    ];

    await workOutMutations(standardMutationsArgsToUpdateThing, commonResolverCreatorArg);

    const [personClones2] = await workOutMutations(
      standardMutationsArgsToCopyManyThings,
      commonResolverCreatorArg,
    );

    const [personClone2] = personClones2;

    expect(personClone2.firstName).toBe(dataToUpdate.firstName);
    expect(personClone2.lastName).toBe(dataToUpdate.lastName);
    expect(personClone2.original.toString()).toBe(createdPerson.id.toString());
  });

  test('should create resolvers for chain of 1 copyManyThingsWithChildren', async () => {
    const createMenu = createCreateThingMutationResolver(
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
        actionGeneralName: 'copyManyThingsWithChildren',
        thingConfig: menuCloneConfig,
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

    const standardMutationsArgsToUpdateThing = [
      {
        actionGeneralName: 'updateThing',
        thingConfig: menuConfig,
        args: {
          whereOne: { id: createdMenu.id },
          data: dataToUpdate,
        },
        returnResult: false,
      },
    ];

    await workOutMutations(standardMutationsArgsToUpdateThing, commonResolverCreatorArg);

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
