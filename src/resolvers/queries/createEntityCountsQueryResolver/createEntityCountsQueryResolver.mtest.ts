import mongoose from 'mongoose';

import type { GeneralConfig, EntityConfig, TangibleEntityConfig } from '../../../tsTypes';

import mongoOptions from '../../../test/mongo-options';
import sleep from '../../../utils/sleep';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import pubsub from '../../utils/pubsub';
import createCreateEntityMutationResolver from '../../mutations/createCreateEntityMutationResolver';
import composeQueryResolver from '../../utils/composeQueryResolver';
import createEntityCountsQueryResolver from './index';

mongoose.set('strictQuery', false);

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entity-counts-query';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

describe('createEntityCountsQueryResolver', () => {
  const serversideConfig: Record<string, any> = {};

  test('should create query entity counts resolver', async () => {
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
        {
          name: 'theBestFriend',
          oppositeName: 'theBestFriend',
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
          { firstName: 'Fred', lastName: 'Prashkin', position: 'programmer', age: 35 },
        ],
      },
      theBestFriend: {
        create: {
          firstName: 'Stanislav',
          lastName: 'Bzhezinsky',
          position: 'programmer',
          age: 40,
        },
      },
    };
    const createdPerson = await createPerson(null, { data }, { mongooseConn, pubsub }, null, {
      involvedFilters: { inputOutputFilterAndLimit: [[]] },
    });

    const PersonCounts = createEntityCountsQueryResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    if (!PersonCounts) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const restrictedWhere = [{}, { age_gte: 35 }, { position: 'boss' }, { age_gt: 100 }];

    const counts = await PersonCounts(null, { restrictedWhere }, { mongooseConn, pubsub }, null, {
      involvedFilters: { inputOutputFilterAndLimit: [[]] },
    });

    expect(counts).toEqual([5, 3, 1, 0]);

    const where = { position: 'programmer' };
    const counts2 = await PersonCounts(
      null,
      { where, restrictedWhere },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
    );

    expect(counts2).toEqual([4, 2, 0, 0]);

    const where2 = { friends: createdPerson.id };
    const restrictedWhere2 = [{ OR: [{ age: 25 }, { age: 35 }] }, { id_in: [createdPerson.id] }];
    const counts3 = await PersonCounts(
      null,
      { where: where2, restrictedWhere: restrictedWhere2 },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
    );

    expect(counts3).toEqual([2, 0]);

    const where3 = { position: 'bla-bla-bla' };
    const counts4 = await PersonCounts(
      null,
      { where: where3, restrictedWhere },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
    );

    expect(counts4).toEqual([0, 0, 0, 0]);

    // filter restricts every count
    const counts5 = await PersonCounts(null, { restrictedWhere }, { mongooseConn, pubsub }, null, {
      involvedFilters: { inputOutputFilterAndLimit: [[{ age_lt: 40 }]] },
    });

    expect(counts5).toEqual([3, 1, 0, 0]);

    // forbidden by filter
    const counts6 = await PersonCounts(null, { restrictedWhere }, { mongooseConn, pubsub }, null, {
      involvedFilters: { inputOutputFilterAndLimit: null },
    });

    expect(counts6).toEqual([0, 0, 0, 0]);

    const counts7 = await PersonCounts(
      null,
      { restrictedWhere: [] },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
    );

    expect(counts7).toEqual([]);

    await expect(
      PersonCounts(
        null,
        { restrictedWhere: [{ friends_: { position: 'boss' } }] },
        { mongooseConn, pubsub },
        null,
        { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
      ),
    ).rejects.toThrow('Relational field: "friends_" forbidden in restricted where');

    // raw resolver got by "composeQueryResolver" is created regardless of "inventory"
    const generalConfigWithInventory: GeneralConfig = {
      ...generalConfig,
      inventory: { name: 'test', include: { Query: { entities: ['Person'] } } },
    };

    expect(
      createEntityCountsQueryResolver(personConfig, generalConfigWithInventory, serversideConfig),
    ).toBeNull();

    const PersonCounts2 = composeQueryResolver(
      'Person_Counts',
      generalConfigWithInventory,
      serversideConfig,
    );

    const counts8 = await PersonCounts2(
      null,
      { where, restrictedWhere },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
    );

    expect(counts8).toEqual(counts2);
  });

  test('should create query entity counts resolver to aggregate result', async () => {
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
            textFields: [`text-${i}`],
            textField: i < 15 ? 'first' : 'second',
          },
        },
      };

      await createParent(null, { data }, { mongooseConn, pubsub }, null, {
        involvedFilters: { inputOutputFilterAndLimit: [[]] },
      });
    }

    const ParentCounts = createEntityCountsQueryResolver(
      parentConfig,
      generalConfig,
      serversideConfig,
    );
    if (!ParentCounts) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const restrictedWhere = [{}, { num_lt: 10 }, { num_gte: 10 }];

    // lookups of the common "where" are applied before "$facet"
    const where = { child_: { textField: 'second' } };
    const counts = await ParentCounts(
      null,
      { where, restrictedWhere },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
    );

    expect(counts).toEqual([5, 0, 5]);

    // name2 -> num 6, 7, 8
    const search = 'name2';
    const counts2 = await ParentCounts(
      null,
      { search, restrictedWhere: [...restrictedWhere, { num: 7 }] },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
    );

    expect(counts2).toEqual([3, 3, 0, 1]);

    const where2 = { child_: { textFields_in: ['text-2', 'text-4', 'text-12', 'text-99'] } };
    const counts3 = await ParentCounts(
      null,
      { where: where2, restrictedWhere },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
    );

    expect(counts3).toEqual([3, 2, 1]);

    // the common "where" selects no documents: "$facet" gets empty input ...
    // ... and every facet is "[]" (not "[{ count: 0 }]")

    const restrictedWhere2 = [{}, { num_lt: 10 }, { num: 7 }];

    const where3 = { child_: { textField: 'third' } };
    const counts4 = await ParentCounts(
      null,
      { where: where3, restrictedWhere: restrictedWhere2 },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
    );

    expect(counts4).toEqual([0, 0, 0]);

    const where4 = { num_gt: 100 };
    const counts5 = await ParentCounts(
      null,
      { where: where4, restrictedWhere: restrictedWhere2 },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
    );

    expect(counts5).toEqual([0, 0, 0]);

    const counts6 = await ParentCounts(
      null,
      { search: 'bla-bla-bla', restrictedWhere: restrictedWhere2 },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
    );

    expect(counts6).toEqual([0, 0, 0]);

    // "where" & filter select documents separately but not together
    const counts7 = await ParentCounts(
      null,
      { where: { num_lt: 5 }, restrictedWhere: restrictedWhere2 },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: [[{ num_gte: 5 }]] } },
    );

    expect(counts7).toEqual([0, 0, 0]);
  });
});
