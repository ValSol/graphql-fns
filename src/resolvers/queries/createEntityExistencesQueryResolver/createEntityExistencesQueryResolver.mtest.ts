import mongoose from 'mongoose';

import type { GeneralConfig, EntityConfig, TangibleEntityConfig } from '../../../tsTypes';

import mongoOptions from '../../../test/mongo-options';
import sleep from '../../../utils/sleep';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import pubsub from '../../utils/pubsub';
import createCreateEntityMutationResolver from '../../mutations/createCreateEntityMutationResolver';
import createEntityExistencesQueryResolver from './index';

mongoose.set('strictQuery', false);

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entity-existences-query';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

describe('createEntityExistencesQueryResolver', () => {
  const serversideConfig: Record<string, any> = {};

  test('should create query entity existences resolver', async () => {
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
      intFields: [
        {
          name: 'age',
          index: true,
          type: 'intFields',
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
      ],
    });

    const generalConfig: GeneralConfig = { allEntityConfigs: { Person: personConfig } };

    const exampleSchema = createThingSchema(personConfig);
    const Example = mongooseConn.model('Person_', exampleSchema);
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
      firstName: 'Hugo',
      lastName: 'Boss',
      position: 'boss',
      age: 50,
      friends: {
        create: [
          { firstName: 'Adam', lastName: 'Mashkin', position: 'programmer', age: 25 },
          { firstName: 'Andy', lastName: 'Daskin', position: 'programmer', age: 30 },
        ],
      },
    };
    const createdPerson = await createPerson(null, { data }, { mongooseConn, pubsub }, null, {
      involvedFilters: { inputOutputFilterAndLimit: [[]] },
    });

    const PersonExistences = createEntityExistencesQueryResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    if (!PersonExistences) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const whereAndSearch = [
      {},
      { where: {} },
      { where: { age_gte: 50 } },
      { where: { position: 'programmer', age_gt: 25 } },
      { where: { age_gt: 100 } },
      { where: { friends: createdPerson.id, position: 'boss' } },
      { where: { OR: [{ age: 26 }, { age: 31 }] } },
    ];

    const existences = await PersonExistences(
      null,
      { whereAndSearch },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
    );

    expect(existences).toEqual([true, true, true, true, false, false, false]);

    // filter restricts every item
    const existences2 = await PersonExistences(
      null,
      { whereAndSearch },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: [[{ age_lt: 30 }]] } },
    );

    expect(existences2).toEqual([true, true, false, false, false, false, false]);

    // forbidden by filter
    const existences3 = await PersonExistences(
      null,
      { whereAndSearch },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: null } },
    );

    expect(existences3).toEqual([false, false, false, false, false, false, false]);

    const existences4 = await PersonExistences(
      null,
      { whereAndSearch: [] },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
    );

    expect(existences4).toEqual([]);

    // queries run by 2 at once give the same result in the same order
    const PersonExistences2 = createEntityExistencesQueryResolver(personConfig, generalConfig, {
      entityExistencesConcurrency: 2,
    });
    if (!PersonExistences2) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const existences5 = await PersonExistences2(
      null,
      { whereAndSearch },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
    );

    expect(existences5).toEqual([true, true, true, true, false, false, false]);
  });

  test('should create query entity existences resolver to aggregate result', async () => {
    const parentConfig = {} as TangibleEntityConfig;

    const childConfig: EntityConfig = {
      name: 'Child',
      type: 'tangible',
      textFields: [
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
      intFields: [
        {
          name: 'num',
          index: true,
          type: 'intFields',
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
    const Example = mongooseConn.model('Parent_', exampleSchema);
    await Example.createCollection();

    const exampleSchema2 = createThingSchema(childConfig);
    const Example2 = mongooseConn.model('Child_', exampleSchema2);
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
        num: i,
        child: {
          create: {
            textField: i < 15 ? 'first' : 'second',
          },
        },
      };

      await createParent(null, { data }, { mongooseConn, pubsub }, null, {
        involvedFilters: { inputOutputFilterAndLimit: [[]] },
      });
    }

    const ParentExistences = createEntityExistencesQueryResolver(
      parentConfig,
      generalConfig,
      serversideConfig,
    );
    if (!ParentExistences) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    // name2 -> num 6, 7, 8; "second" -> num 15..19
    const whereAndSearch = [
      { search: 'name2' },
      { where: { num: 7 }, search: 'name2' },
      { where: { num: 10 }, search: 'name2' },
      { search: 'bla-bla-bla' },
      { where: { child_: { textField: 'second' } } },
      { where: { child_: { textField: 'second' }, num_lt: 15 } },
      { where: { child_: { textField: 'third' } } },
      { where: { child_: { textField: 'first' }, num: 3 }, search: 'name1' },
      { where: { child_: { textField: 'second' } }, search: 'name1' },
    ];

    const existences = await ParentExistences(
      null,
      { whereAndSearch },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
    );

    expect(existences).toEqual([true, true, false, false, true, false, false, true, false]);

    // "where" & filter select documents separately but not together
    const existences2 = await ParentExistences(
      null,
      { whereAndSearch: [{ where: { num_lt: 5 } }, { where: { num_lt: 6 } }] },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: [[{ num_gte: 5 }]] } },
    );

    expect(existences2).toEqual([false, true]);
  });
});
