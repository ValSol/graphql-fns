import { jest } from '@jest/globals';
import mongoose from 'mongoose';

import type { GeneralConfig, TangibleEntityConfig } from '../../../tsTypes';

import mongoOptions from '../../../test/mongo-options';
import createEntitySchema from '../../../mongooseModels/createEntitySchema';
import workOutMutations from '../workOutMutations';
import createGetOrCreateEntityMutationResolver from './index';

mongoose.set('strictQuery', false);

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-get-or-create-entity-mutation';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

describe('createGetOrCreateEntityMutationResolver', () => {
  const serversideConfig = { transactions: true };

  const personConfig: TangibleEntityConfig = {
    name: 'Person',
    type: 'tangible',
    textFields: [
      { name: 'email', unique: true, type: 'textFields' },
      { name: 'name', type: 'textFields' },
      { name: 'owner', type: 'textFields' },
    ],
  };

  const menuConfig: TangibleEntityConfig = {
    name: 'Menu',
    type: 'tangible',
    textFields: [
      { name: 'title', type: 'textFields' },
      { name: 'lang', type: 'textFields' },
      { name: 'description', type: 'textFields' },
    ],
    uniqueCompoundIndexes: [['title', 'lang']],
  };

  const generalConfig: GeneralConfig = {
    allEntityConfigs: { Person: personConfig, Menu: menuConfig },
  };

  const pubsub = { publish: jest.fn<(channel: string, payload: any) => void>() };

  const fullAccess = { involvedFilters: { inputOutputFilterAndLimit: [[]] } };

  let Person;
  let Menu;

  beforeAll(async () => {
    Person = mongooseConn.model('Person_Thing', createEntitySchema(personConfig));
    await Person.init(); // build unique index on "email"
    await Person.createCollection();

    Menu = mongooseConn.model('Menu_Thing', createEntitySchema(menuConfig));
    await Menu.init(); // build unique compound index
    await Menu.createCollection();
  });

  beforeEach(() => {
    pubsub.publish.mockClear();
  });

  const getOrCreatePerson = createGetOrCreateEntityMutationResolver(
    personConfig,
    generalConfig,
    serversideConfig,
  );

  const getOrCreateMenu = createGetOrCreateEntityMutationResolver(
    menuConfig,
    generalConfig,
    serversideConfig,
  );

  test('should create entity with "whereOne" fields & then get it', async () => {
    const created = await getOrCreatePerson(
      null,
      { whereOne: { email: 'ann@b.c' }, data: { name: 'Ann' } },
      { mongooseConn, pubsub },
      null,
      fullAccess,
    );

    expect(created).toMatchObject({ email: 'ann@b.c', name: 'Ann' });

    const got = await getOrCreatePerson(
      null,
      { whereOne: { email: 'ann@b.c' }, data: { name: 'Other name' } },
      { mongooseConn, pubsub },
      null,
      fullAccess,
    );

    expect(got.id.toString()).toBe(created.id.toString());
    expect(got.name).toBe('Ann');
    expect(await Person.countDocuments({ email: 'ann@b.c' })).toBe(1);
  });

  test('should get entity by "id"', async () => {
    const { _id: id } = await Person.create({ email: 'bob@b.c', name: 'Bob' });

    const got = await getOrCreatePerson(
      null,
      { whereOne: { id }, data: { name: 'Other' } },
      { mongooseConn, pubsub },
      null,
      fullAccess,
    );

    expect(got.id.toString()).toBe(id.toString());
    expect(got.name).toBe('Bob');
  });

  test('should create & get entity by "whereCompoundOne"', async () => {
    const created = await getOrCreateMenu(
      null,
      { whereCompoundOne: { title: 'Lunch', lang: 'en' }, data: { description: 'Daily' } },
      { mongooseConn, pubsub },
      null,
      fullAccess,
    );

    expect(created).toMatchObject({ title: 'Lunch', lang: 'en', description: 'Daily' });

    const got = await getOrCreateMenu(
      null,
      { whereCompoundOne: { title: 'Lunch', lang: 'en' }, data: {} },
      { mongooseConn, pubsub },
      null,
      fullAccess,
    );

    expect(got.id.toString()).toBe(created.id.toString());
    expect(await Menu.countDocuments({ title: 'Lunch' })).toBe(1);
  });

  test('should throw on "data" that conflicts with "whereOne"', async () => {
    await expect(
      getOrCreatePerson(
        null,
        { whereOne: { email: 'carl@b.c' }, data: { email: 'other@b.c' } },
        { mongooseConn, pubsub },
        null,
        fullAccess,
      ),
    ).rejects.toThrow('Value of field "email" in "data" arg conflicts with "whereOne" arg');

    expect(await Person.countDocuments({ email: { $in: ['carl@b.c', 'other@b.c'] } })).toBe(0);
  });

  test('should return "null" without access', async () => {
    const result = await getOrCreatePerson(
      null,
      { whereOne: { email: 'dan@b.c' }, data: {} },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: null } },
    );

    expect(result).toBeNull();
    expect(await Person.countDocuments({ email: 'dan@b.c' })).toBe(0);
  });

  test('should return "null" if existing entity is not available for user', async () => {
    await Person.create({ email: 'eve@b.c', name: 'Eve', owner: 'user1' });

    const result = await getOrCreatePerson(
      null,
      { whereOne: { email: 'eve@b.c' }, data: { owner: 'user2' } },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: [[{ owner: 'user2' }]] } },
    );

    expect(result).toBeNull();
    expect(await Person.countDocuments({ email: 'eve@b.c' })).toBe(1);
  });

  test('should publish "created" event only for created entity', async () => {
    const resolverOptions = {
      ...fullAccess,
      subscriptionEntityNames: { subscriptionCreatedEntityName: 'Person' },
    };

    const created = await getOrCreatePerson(
      null,
      { whereOne: { email: 'fay@b.c' }, data: { name: 'Fay' } },
      { mongooseConn, pubsub },
      null,
      resolverOptions,
    );

    expect(pubsub.publish).toHaveBeenCalledTimes(1);
    expect(pubsub.publish.mock.calls[0][0]).toBe('created-Person');
    expect(pubsub.publish.mock.calls[0][1].createdPerson.node.id.toString()).toBe(
      created.id.toString(),
    );

    await getOrCreatePerson(
      null,
      { whereOne: { email: 'fay@b.c' }, data: { name: 'Fay' } },
      { mongooseConn, pubsub },
      null,
      resolverOptions,
    );

    expect(pubsub.publish).toHaveBeenCalledTimes(1);
  });

  test('should get & create entities in "workOutMutations"', async () => {
    const commonResolverCreatorArg = {
      generalConfig,
      serversideConfig,
      context: { mongooseConn, pubsub },
    };

    const [got, created, createdByCreateEntity] = await workOutMutations(
      [
        {
          actionGeneralName: 'getOrCreateEntity',
          entityConfig: personConfig,
          args: { whereOne: { email: 'ann@b.c' }, data: { name: 'Other' } },
          returnResult: true,
        },
        {
          actionGeneralName: 'getOrCreateEntity',
          entityConfig: personConfig,
          args: { whereOne: { email: 'gus@b.c' }, data: { name: 'Gus' } },
          returnResult: true,
        },
        {
          actionGeneralName: 'createEntity',
          entityConfig: personConfig,
          args: { data: { email: 'hal@b.c', name: 'Hal' } },
          returnResult: true,
        },
      ],
      commonResolverCreatorArg,
    );

    expect(got).toMatchObject({ email: 'ann@b.c', name: 'Ann' });
    expect(created).toMatchObject({ email: 'gus@b.c', name: 'Gus' });
    expect(createdByCreateEntity).toMatchObject({ email: 'hal@b.c', name: 'Hal' });

    expect(await Person.countDocuments({ email: 'ann@b.c' })).toBe(1);
    expect(await Person.countDocuments({ email: 'gus@b.c' })).toBe(1);
  });
});
