import { jest } from '@jest/globals';
import mongoose from 'mongoose';

import type { GeneralConfig, TangibleEntityConfig } from '../../../tsTypes';

import mongoOptions from '../../../test/mongo-options';
import createEntitySchema from '../../../mongooseModels/createEntitySchema';
import workOutMutations from '../workOutMutations';
import createGetOrCreateManyEntitiesMutationResolver from './index';

mongoose.set('strictQuery', false);

let mongooseConn;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-get-or-create-entities-mutation';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

describe('createGetOrCreateManyEntitiesMutationResolver', () => {
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

  const slotConfig: TangibleEntityConfig = {
    name: 'Slot',
    type: 'tangible',
    intFields: [{ name: 'room', type: 'intFields' }],
    dateTimeFields: [{ name: 'start', type: 'dateTimeFields' }],
    textFields: [{ name: 'note', type: 'textFields' }],
    uniqueCompoundIndexes: [['room', 'start']],
  };

  const generalConfig: GeneralConfig = {
    allEntityConfigs: { Person: personConfig, Menu: menuConfig, Slot: slotConfig },
  };

  const pubsub = { publish: jest.fn<(channel: string, payload: any) => void>() };

  const fullAccess = { involvedFilters: { inputOutputFilterAndLimit: [[]] } };

  let Person;
  let Menu;
  let Slot;

  beforeAll(async () => {
    Person = mongooseConn.model('Person_Thing', createEntitySchema(personConfig));
    await Person.init(); // build unique index on "email"
    await Person.createCollection();

    Menu = mongooseConn.model('Menu_Thing', createEntitySchema(menuConfig));
    await Menu.init(); // build unique compound index
    await Menu.createCollection();

    Slot = mongooseConn.model('Slot_Thing', createEntitySchema(slotConfig));
    await Slot.init(); // build unique compound index
    await Slot.createCollection();
  });

  beforeEach(() => {
    pubsub.publish.mockClear();
  });

  const getOrCreateManyPeople = createGetOrCreateManyEntitiesMutationResolver(
    personConfig,
    generalConfig,
    serversideConfig,
  );

  const getOrCreateManyMenus = createGetOrCreateManyEntitiesMutationResolver(
    menuConfig,
    generalConfig,
    serversideConfig,
  );

  test('should create entities with "whereOne" fields & then get them', async () => {
    const created = await getOrCreateManyPeople(
      null,
      {
        whereOneAndData: [
          { whereOne: { email: 'ann@b.c' }, data: { name: 'Ann' } },
          { whereOne: { email: 'bob@b.c' }, data: { name: 'Bob' } },
        ],
      },
      { mongooseConn, pubsub },
      null,
      fullAccess,
    );

    expect(created).toHaveLength(2);
    expect(created[0]).toMatchObject({ email: 'ann@b.c', name: 'Ann' });
    expect(created[1]).toMatchObject({ email: 'bob@b.c', name: 'Bob' });

    const got = await getOrCreateManyPeople(
      null,
      {
        whereOneAndData: [
          { whereOne: { email: 'bob@b.c' }, data: { name: 'Other' } },
          { whereOne: { email: 'ann@b.c' }, data: { name: 'Other' } },
        ],
      },
      { mongooseConn, pubsub },
      null,
      fullAccess,
    );

    expect(got.map(({ id }) => id.toString())).toEqual([
      created[1].id.toString(),
      created[0].id.toString(),
    ]);
    expect(got.map(({ name }) => name)).toEqual(['Bob', 'Ann']);
    expect(await Person.countDocuments({ email: { $in: ['ann@b.c', 'bob@b.c'] } })).toBe(2);
    expect(pubsub.publish).not.toHaveBeenCalled();
  });

  test('should get & create entities in the order of items', async () => {
    const { _id: id } = await Person.create({ email: 'carl@b.c', name: 'Carl' });

    const result = await getOrCreateManyPeople(
      null,
      {
        whereOneAndData: [
          { whereOne: { email: 'dan@b.c' }, data: { name: 'Dan' } },
          { whereOne: { id }, data: { name: 'Other' } },
          { whereOne: { email: 'ann@b.c' }, data: {} },
          { whereOne: { email: 'eve@b.c' }, data: { name: 'Eve' } },
        ],
      },
      { mongooseConn, pubsub },
      null,
      fullAccess,
    );

    expect(result.map(({ email, name }) => [email, name])).toEqual([
      ['dan@b.c', 'Dan'],
      ['carl@b.c', 'Carl'],
      ['ann@b.c', 'Ann'],
      ['eve@b.c', 'Eve'],
    ]);
  });

  test('should create once entity selected by several items', async () => {
    const result = await getOrCreateManyPeople(
      null,
      {
        whereOneAndData: [
          { whereOne: { email: 'fay@b.c' }, data: { name: 'Fay' } },
          { whereOne: { email: 'fay@b.c' }, data: { name: 'Other' } },
        ],
      },
      { mongooseConn, pubsub },
      null,
      fullAccess,
    );

    expect(result).toHaveLength(2);
    expect(result[1].id.toString()).toBe(result[0].id.toString());
    expect(result[1].name).toBe('Fay');
    expect(await Person.countDocuments({ email: 'fay@b.c' })).toBe(1);
  });

  test('should create & get entities by "whereCompoundOne"', async () => {
    const created = await getOrCreateManyMenus(
      null,
      {
        whereCompoundOneAndData: [
          { whereCompoundOne: { title: 'Lunch', lang: 'en' }, data: { description: 'Daily' } },
          { whereCompoundOne: { title: 'Lunch', lang: 'uk' }, data: {} },
        ],
      },
      { mongooseConn, pubsub },
      null,
      fullAccess,
    );

    expect(created[0]).toMatchObject({ title: 'Lunch', lang: 'en', description: 'Daily' });
    expect(created[1]).toMatchObject({ title: 'Lunch', lang: 'uk' });

    const got = await getOrCreateManyMenus(
      null,
      {
        whereCompoundOneAndData: [{ whereCompoundOne: { title: 'Lunch', lang: 'en' }, data: {} }],
      },
      { mongooseConn, pubsub },
      null,
      fullAccess,
    );

    expect(got[0].id.toString()).toBe(created[0].id.toString());
    expect(await Menu.countDocuments({ title: 'Lunch' })).toBe(2);
  });

  test('should match found entities by "Int" & "DateTime" fields of "whereCompoundOne"', async () => {
    const getOrCreateManySlots = createGetOrCreateManyEntitiesMutationResolver(
      slotConfig,
      generalConfig,
      serversideConfig,
    );

    const existing = await Slot.create({
      room: 1,
      start: new Date('2026-01-01T10:00:00.000Z'),
      note: 'Existing',
    });

    const result = await getOrCreateManySlots(
      null,
      {
        whereCompoundOneAndData: [
          {
            whereCompoundOne: { room: 1, start: new Date('2026-01-01T11:00:00.000Z') },
            data: { note: 'New' },
          },
          {
            whereCompoundOne: { start: new Date('2026-01-01T10:00:00.000Z'), room: 1 },
            data: { note: 'Other' },
          },
          {
            whereCompoundOne: { room: 2, start: new Date('2026-01-01T10:00:00.000Z') },
            data: { note: 'New2' },
          },
        ],
      },
      { mongooseConn, pubsub },
      null,
      fullAccess,
    );

    expect(result.map(({ note }) => note)).toEqual(['New', 'Existing', 'New2']);
    expect(result[1].id.toString()).toBe(existing._id.toString());
    expect(await Slot.countDocuments({})).toBe(3);
  });

  test('should throw on "data" that conflicts with "whereOne" without any writes', async () => {
    await expect(
      getOrCreateManyPeople(
        null,
        {
          whereOneAndData: [
            { whereOne: { email: 'gus@b.c' }, data: {} },
            { whereOne: { email: 'hal@b.c' }, data: { email: 'other@b.c' } },
          ],
        },
        { mongooseConn, pubsub },
        null,
        fullAccess,
      ),
    ).rejects.toThrow('Value of field "email" in "data" arg conflicts with "whereOne" arg');

    expect(
      await Person.countDocuments({ email: { $in: ['gus@b.c', 'hal@b.c', 'other@b.c'] } }),
    ).toBe(0);
  });

  test('should return "null" without access', async () => {
    const result = await getOrCreateManyPeople(
      null,
      { whereOneAndData: [{ whereOne: { email: 'ian@b.c' }, data: {} }] },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: null } },
    );

    expect(result).toBeNull();
    expect(await Person.countDocuments({ email: 'ian@b.c' })).toBe(0);
  });

  test('should return "null" if existing entity is not available for user', async () => {
    await Person.create({ email: 'jan@b.c', name: 'Jan', owner: 'user1' });

    const result = await getOrCreateManyPeople(
      null,
      {
        whereOneAndData: [
          { whereOne: { email: 'kim@b.c' }, data: { owner: 'user2' } },
          { whereOne: { email: 'jan@b.c' }, data: { owner: 'user2' } },
        ],
      },
      { mongooseConn, pubsub },
      null,
      { involvedFilters: { inputOutputFilterAndLimit: [[{ owner: 'user2' }]] } },
    );

    expect(result).toBeNull();
    expect(await Person.countDocuments({ email: 'jan@b.c' })).toBe(1);
    expect(await Person.countDocuments({ email: 'kim@b.c' })).toBe(0);
  });

  test('should get & create entities in "workOutMutations"', async () => {
    const commonResolverCreatorArg = {
      generalConfig,
      serversideConfig,
      context: { mongooseConn, pubsub },
    };

    const [many, one] = await workOutMutations(
      [
        {
          actionGeneralName: 'getOrCreateManyEntities',
          entityConfig: personConfig,
          args: {
            whereOneAndData: [
              { whereOne: { email: 'leo@b.c' }, data: { name: 'Leo' } },
              { whereOne: { email: 'ann@b.c' }, data: { name: 'Other' } },
            ],
          },
          returnResult: true,
        },
        {
          actionGeneralName: 'getOrCreateEntity',
          entityConfig: personConfig,
          args: { whereOne: { email: 'max@b.c' }, data: { name: 'Max' } },
          returnResult: true,
        },
      ],
      commonResolverCreatorArg,
    );

    expect(many.map(({ email, name }) => [email, name])).toEqual([
      ['leo@b.c', 'Leo'],
      ['ann@b.c', 'Ann'],
    ]);
    expect(one).toMatchObject({ email: 'max@b.c', name: 'Max' });
    expect(await Person.countDocuments({ email: { $in: ['leo@b.c', 'max@b.c'] } })).toBe(2);
  });
});
