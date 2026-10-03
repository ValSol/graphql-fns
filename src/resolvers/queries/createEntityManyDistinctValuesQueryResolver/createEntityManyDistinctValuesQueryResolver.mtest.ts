import mongoose from 'mongoose';

import type { GeneralConfig, EntityConfig, TangibleEntityConfig } from '../../../tsTypes';

import mongoOptions from '../../../test/mongo-options';
import sleep from '../../../utils/sleep';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import createMongooseModel from '../../../mongooseModels/createMongooseModel';
import pubsub from '../../utils/pubsub';
import createCreateEntityMutationResolver from '../../mutations/createCreateEntityMutationResolver';
import composeQueryResolver from '../../utils/composeQueryResolver';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';
import composeAggregateHead from '../../utils/mergeWhereAndFilter/composeAggregateHead';
import createEntityDistinctValuesQueryResolver from '../createEntityDistinctValuesQueryResolver';
import createEntityManyDistinctValuesQueryResolver from './index';

mongoose.set('strictQuery', false);

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entity-many-distinct-values-query';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

// the relational branch of "XDistinctValues" before it was replaced by one aggregate
const oldDistinctValues = async (
  entityConfig: EntityConfig,
  { where, search }: { where?: any; search?: string },
  target: string,
) => {
  const Entity = await createMongooseModel(mongooseConn, entityConfig);

  const { lookups, where: where2 } = mergeWhereAndFilter([], where, entityConfig);

  const pipeline = composeAggregateHead({ where: where2, lookups, search, sortByTextScore: true });

  if (!search) pipeline.push({ $project: { _id: 1 } });

  const ids = await Entity.aggregate(pipeline).exec();

  const result = await Entity.distinct(target, { _id: { $in: ids } });

  return result.filter(Boolean);
};

const involvedFilters = { inputOutputFilterAndLimit: [[]] };

describe('createEntityManyDistinctValuesQueryResolver', () => {
  const serversideConfig: Record<string, any> = {};

  test('should create query entity many distinct values resolver', async () => {
    const itemConfig: EntityConfig = {
      name: 'Item',
      type: 'embedded',
      textFields: [{ name: 'text', type: 'textFields' }],
    };

    const personConfig = {} as EntityConfig;
    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
      textFields: [
        { name: 'firstName', required: true, weight: 1, type: 'textFields' },
        { name: 'position', index: true, type: 'textFields' },
        { name: 'skills', array: true, index: true, type: 'textFields' },
      ],
      intFields: [
        { name: 'age', index: true, type: 'intFields' },
        { name: 'level', index: true, type: 'intFields' },
      ],
      embeddedFields: [{ name: 'names', array: true, config: itemConfig, type: 'embeddedFields' }],
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

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Person: personConfig, Item: itemConfig },
    };

    const exampleSchema = createThingSchema(personConfig);
    const Example = mongooseConn.model('Person_Thing', exampleSchema);
    await Example.createCollection();

    await sleep(250);

    const createPerson = createCreateEntityMutationResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    if (!createPerson) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const data = {
      firstName: 'Hugo',
      position: 'boss',
      age: 50,
      level: 0,
      skills: ['lead', 'sales'],
      names: [{ text: 'H' }, { text: 'Boss' }],
      friends: {
        create: [
          {
            firstName: 'Adam',
            position: 'programmer',
            age: 25,
            level: 1,
            skills: ['js', 'ts'],
            names: [{ text: 'A' }],
          },
          { firstName: 'Andy', position: 'programmer', age: 30, level: 2, skills: ['js'] },
          { firstName: 'Fred', position: 'programmer', age: 35, level: 0, skills: [] },
        ],
      },
      theBestFriend: {
        create: {
          firstName: 'Stanislav',
          position: '',
          age: 40,
          level: 3,
          skills: ['go', ''],
          names: [{ text: 'S' }, { text: '' }],
        },
      },
    };
    const createdPerson = await createPerson(null, { data }, { mongooseConn, pubsub }, null, {
      involvedFilters,
    });

    const ManyDistinctValues = createEntityManyDistinctValuesQueryResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );
    if (!ManyDistinctValues) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const DistinctValues = createEntityDistinctValuesQueryResolver(
      personConfig,
      generalConfig,
      serversideConfig,
    );

    // array & scalar fields, ints (with "0") & strings (with ""), embedded path, restricted where
    const restrictedWhereAndTarget = [
      { target: 'position' },
      { target: 'skills' },
      { target: 'level' },
      { target: 'skills', where: { age_gte: 35 } },
      { target: 'names.text' },
      { target: 'age', where: { age_gt: 100 } },
      { target: 'position', where: { id_in: [createdPerson.id] } },
    ];

    const result = await ManyDistinctValues(
      null,
      { restrictedWhereAndTarget },
      { mongooseConn, pubsub },
      null,
      { involvedFilters },
    );

    expect(result).toEqual([
      ['boss', 'programmer'],
      ['go', 'js', 'lead', 'sales', 'ts'],
      [1, 2, 3],
      ['go', 'lead', 'sales'],
      ['A', 'Boss', 'H', 'S'],
      [],
      ['boss'],
    ]);

    // every list is the same as "XDistinctValues" returns for "where" AND the item's "where"
    const argsArr = [
      {},
      { where: { position: 'programmer' } },
      { where: { friends_: { position: 'boss' } } },
      { where: { theBestFriend_: { firstName: 'Hugo' } } },
      { search: 'Adam Fred' },
      { where: { friends_: { position: 'boss' } }, search: 'Adam Fred Hugo' },
      { where: { friends_: { position: 'nobody' } } },
    ];

    for (const args of argsArr) {
      const lists = await ManyDistinctValues(
        null,
        { ...args, restrictedWhereAndTarget },
        { mongooseConn, pubsub },
        null,
        { involvedFilters },
      );

      for (let i = 0; i < restrictedWhereAndTarget.length; i += 1) {
        const { target, where: restrictedWhere } = restrictedWhereAndTarget[i];

        const where = { ...args.where, ...restrictedWhere };

        const singleArgs = { where, search: args.search, options: { target } };

        const values = await DistinctValues(null, singleArgs, { mongooseConn, pubsub }, null, {
          involvedFilters,
        });

        expect(lists[i]).toEqual(values);

        // the fixed relational branch of "XDistinctValues" gives the same as the old one
        if (args.where && Object.keys(args.where)[0].endsWith('_')) {
          expect(values).toEqual(await oldDistinctValues(personConfig, singleArgs, target));
        }
      }
    }

    const result2 = await ManyDistinctValues(
      null,
      {
        where: { friends_: { position: 'boss' } },
        search: 'Adam Fred Hugo',
        restrictedWhereAndTarget,
      },
      { mongooseConn, pubsub },
      null,
      { involvedFilters },
    );

    expect(result2).toEqual([['programmer'], ['js', 'ts'], [1], [], ['A'], [], []]);

    // filter restricts every list
    const result3 = await ManyDistinctValues(
      null,
      { restrictedWhereAndTarget },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: [[{ age_lt: 40 }]] } },
    );

    expect(result3).toEqual([['programmer'], ['js', 'ts'], [1, 2], [], ['A'], [], []]);

    // forbidden by filter
    const result4 = await ManyDistinctValues(
      null,
      { restrictedWhereAndTarget },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: null } },
    );

    expect(result4).toEqual([[], [], [], [], [], [], []]);

    const result5 = await ManyDistinctValues(
      null,
      { restrictedWhereAndTarget: [] },
      { mongooseConn, pubsub },
      null,
      { involvedFilters },
    );

    expect(result5).toEqual([]);

    await expect(
      ManyDistinctValues(
        null,
        { restrictedWhereAndTarget: [{ target: 'position', where: { friends_: { age: 50 } } }] },
        { mongooseConn, pubsub },
        null,
        { involvedFilters },
      ),
    ).rejects.toThrow('Relational field: "friends_" forbidden in restricted where');

    // raw resolver got by "composeQueryResolver" is created regardless of "inventory"
    const generalConfigWithInventory: GeneralConfig = {
      ...generalConfig,
      inventory: { name: 'test', include: { Query: { entities: ['Person'] } } },
    };

    expect(
      createEntityManyDistinctValuesQueryResolver(
        personConfig,
        generalConfigWithInventory,
        serversideConfig,
      ),
    ).toBeNull();

    const ManyDistinctValues2 = composeQueryResolver(
      'Person_ManyDistinctValues',
      generalConfigWithInventory,
      serversideConfig,
    );

    const result6 = await ManyDistinctValues2(
      null,
      { restrictedWhereAndTarget },
      { mongooseConn, pubsub },
      null,
      { involvedFilters },
    );

    expect(result6).toEqual(result);
  });

  test('should create query entity many distinct values resolver to aggregate result', async () => {
    const parentConfig = {} as TangibleEntityConfig;

    const childConfig: EntityConfig = {
      name: 'Child',
      type: 'tangible',
      textFields: [
        { name: 'textFields', array: true, index: true, type: 'textFields' },
        { name: 'textField', index: true, type: 'textFields' },
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
      textFields: [{ name: 'name', index: true, weight: 1, type: 'textFields' }],
      intFields: [{ name: 'num', index: true, type: 'intFields' }],
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

      await createParent(null, { data }, { mongooseConn, pubsub }, null, { involvedFilters });
    }

    const ManyDistinctValues = createEntityManyDistinctValuesQueryResolver(
      parentConfig,
      generalConfig,
      serversideConfig,
    );
    if (!ManyDistinctValues) throw new TypeError('Resolver have to be function!'); // to prevent flowjs error

    const DistinctValues = createEntityDistinctValuesQueryResolver(
      parentConfig,
      generalConfig,
      serversideConfig,
    );

    const restrictedWhereAndTarget = [
      { target: 'name' },
      { target: 'name', where: { num_gte: 10 } },
      { target: 'num', where: { num_lt: 5 } },
    ];

    const where = { child_: { textFields_in: ['text-3', 'text-4', 'text-12', 'text-99'] } };

    const result = await ManyDistinctValues(
      null,
      { where, restrictedWhereAndTarget },
      { mongooseConn, pubsub },
      null,
      { involvedFilters },
    );

    expect(result).toEqual([['name1', 'name4'], ['name4'], [3, 4]]);

    const argsArr = [
      { where },
      { where: { child_: { textField: 'second' } } },
      { where: { child_: { textField: 'third' } } },
      { search: 'name2' },
      { where: { child_: { textField: 'first' } }, search: 'name2 name4' },
    ];

    for (const args of argsArr) {
      const lists = await ManyDistinctValues(
        null,
        { ...args, restrictedWhereAndTarget },
        { mongooseConn, pubsub },
        null,
        { involvedFilters },
      );

      for (let i = 0; i < restrictedWhereAndTarget.length; i += 1) {
        const { target, where: restrictedWhere } = restrictedWhereAndTarget[i];

        const singleArgs = {
          where: { ...args.where, ...restrictedWhere },
          search: args.search,
          options: { target },
        };

        const values = await DistinctValues(null, singleArgs, { mongooseConn, pubsub }, null, {
          involvedFilters,
        });

        expect(lists[i]).toEqual(values);

        if (args.where) {
          expect(values).toEqual(await oldDistinctValues(parentConfig, singleArgs, target));
        }
      }
    }
  });
});
