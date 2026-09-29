import mongoose, { Types } from 'mongoose';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import type {
  GeneralConfig,
  Inventory,
  ServersideConfig,
  SimplifiedEntityConfig,
  SimplifiedEntityFilters,
} from '@/tsTypes';

import mongoOptions from '@/test/mongo-options';
import createMongooseModel from '@/mongooseModels/createMongooseModel';
import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import addChildActions from '@/utils/inventory/addChildActions';
import composeTypeDefsAndResolvers from '@/composeTypeDefsAndResolvers';
import composeServersideConfig from '../../composeServersideConfig';

// "personalFilters" through the GraphQL schema: the filter field is read from the User record
// (pointer "id") or from the record the User points to (any other pointer)

const declarations: SimplifiedEntityConfig[] = [
  {
    name: 'Country',
    type: 'tangible',
    textFields: [{ name: 'code', unique: true }],
    duplexFields: [
      { name: 'cities', oppositeName: 'country', array: true, configName: 'City', parent: true },
    ],
  },
  {
    name: 'City',
    type: 'tangible',
    textFields: [{ name: 'name', index: true }],
    booleanFields: [{ name: 'published' }],
    duplexFields: [{ name: 'country', oppositeName: 'cities', configName: 'Country' }],
  },
  {
    name: 'Group',
    type: 'tangible',
    textFields: [{ name: 'name' }],
    filterFields: [{ name: 'cityFilter', array: true, configName: 'City' }],
  },
  {
    name: 'User',
    type: 'tangible',
    textFields: [{ name: 'name' }],
    filterFields: [{ name: 'cityFilter', array: true, configName: 'City' }],
    relationalFields: [{ name: 'group', oppositeName: 'users', configName: 'Group' }],
  },
];

const allEntityConfigs = composeAllEntityConfigs(declarations);

// no subscriptions, so no "pubsub" is needed
const inventory: Inventory = addChildActions(
  {
    name: 'G',
    include: { Query: { entities: ['Country', 'City'] } },
  },
  { allEntityConfigs },
);

const generalConfig: GeneralConfig = { allEntityConfigs, inventory };

const filters: SimplifiedEntityFilters = {
  City: ({ role }) => (role === 'guest' ? [{ published: true }] : []),
  Country: () => [],
};

const composeSchema = (
  personalFilters: ServersideConfig['personalFilters'],
  skipPersonalFilter?: ServersideConfig['skipPersonalFilter'],
) => {
  const serversideConfig = composeServersideConfig(generalConfig, {
    getUserAttributes: async (context) => context.userAttributes,
    containedRoles: { admin: [], guest: [], user: [] },
    inventoryByRoles: { admin: inventory, guest: inventory, user: inventory },
    // the type of the argument requires "filters" to be both simplified and not
    filters: filters as any,
    personalFilters,
    ...(skipPersonalFilter ? { skipPersonalFilter } : {}),
  });

  const { typeDefs, resolvers } = composeTypeDefsAndResolvers(generalConfig, serversideConfig);

  return makeExecutableSchema({ typeDefs, resolvers });
};

let mongooseConn;

const run = (schema, userAttributes: Record<string, any>) =>
  graphql({
    schema,
    source: '{ Cities(sort: { sortBy: [name_ASC] }) { name } Countries { cities { name } } }',
    contextValue: { mongooseConn, userAttributes },
  });

const cityNames = (names: string[]) => ({
  Cities: names.map((name) => ({ name })),
  Countries: [{ cities: names.map((name) => ({ name })) }],
});

const absentId = '000000000000000000000008';

const ids = {
  userKyiv: new Types.ObjectId().toString(),
  userAll: new Types.ObjectId().toString(),
  guest: new Types.ObjectId().toString(),
  userWithoutFilter: new Types.ObjectId().toString(),
  userInKyivGroup: new Types.ObjectId().toString(),
  userInGroupWithoutFilter: new Types.ObjectId().toString(),
  userInAbsentGroup: new Types.ObjectId().toString(),
  kyivGroup: new Types.ObjectId().toString(),
  groupWithoutFilter: new Types.ObjectId().toString(),
};

mongoose.set('strictQuery', false);

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-personal-filters';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  const Country = await createMongooseModel(mongooseConn, allEntityConfigs.Country);
  const City = await createMongooseModel(mongooseConn, allEntityConfigs.City);
  const Group = await createMongooseModel(mongooseConn, allEntityConfigs.Group);
  const User = await createMongooseModel(mongooseConn, allEntityConfigs.User);

  const cities = [
    { _id: new Types.ObjectId(), name: 'Kyiv', published: true },
    { _id: new Types.ObjectId(), name: 'Lviv', published: true },
    { _id: new Types.ObjectId(), name: 'Odesa', published: false },
  ];

  const [country] = await Country.create([{ code: 'UA', cities: cities.map(({ _id }) => _id) }]);
  await City.create(cities.map((city) => ({ ...city, country: country._id })));

  const kyivFilter = JSON.stringify({ name: 'Kyiv' });

  await Group.create([
    { _id: ids.kyivGroup, name: 'Kyiv group', cityFilter: kyivFilter },
    { _id: ids.groupWithoutFilter, name: 'Group without filter' },
  ]);

  await User.create([
    { _id: ids.userKyiv, name: 'Kyiv', cityFilter: kyivFilter },
    { _id: ids.userAll, name: 'All', cityFilter: JSON.stringify({}) },
    { _id: ids.guest, name: 'Guest', cityFilter: JSON.stringify({}) },
    { _id: ids.userWithoutFilter, name: 'Without filter' },
    { _id: ids.userInKyivGroup, name: 'In Kyiv group', group: ids.kyivGroup },
    { _id: ids.userInGroupWithoutFilter, name: 'In group', group: ids.groupWithoutFilter },
    { _id: ids.userInAbsentGroup, name: 'In absent group', group: absentId },
  ]);
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('personalFilters with the filter field of the User record', () => {
  const schema = composeSchema(
    { City: ['User', 'id', 'cityFilter'] },
    (entityName, { roles }) => roles.includes('admin'),
  );

  test('the filter field restricts access (AND with "filters")', async () => {
    const result = await run(schema, { roles: ['user'], id: ids.userKyiv });

    expect(result).toEqual({ data: cityNames(['Kyiv']) });
  });

  test('an empty filter object gives access permitted by "filters"', async () => {
    const result = await run(schema, { roles: ['user'], id: ids.userAll });

    expect(result).toEqual({ data: cityNames(['Kyiv', 'Lviv', 'Odesa']) });
  });

  test('a guest with the id of a guest User record gets access permitted by "filters"', async () => {
    const result = await run(schema, { roles: ['guest'], id: ids.guest });

    expect(result).toEqual({ data: cityNames(['Kyiv', 'Lviv']) });
  });

  test('no access if the filter field is not set', async () => {
    const result = await run(schema, { roles: ['user'], id: ids.userWithoutFilter });

    expect(result).toEqual({ data: cityNames([]) });
  });

  test('no access if there is no User record with "id"', async () => {
    const result = await run(schema, { roles: ['user'], id: absentId });

    expect(result).toEqual({ data: cityNames([]) });
  });

  // "id" is required for every user with roles, the guest included
  test('no access without "id"', async () => {
    const result = await run(schema, { roles: ['guest'] });

    expect(result).toEqual({ data: cityNames([]) });
  });

  test('"skipPersonalFilter" gives access permitted by "filters"', async () => {
    const result = await run(schema, { roles: ['admin'], id: absentId });

    expect(result).toEqual({ data: cityNames(['Kyiv', 'Lviv', 'Odesa']) });
  });
});

describe('personalFilters with the filter field of the record the User points to', () => {
  const schema = composeSchema({ City: ['User', 'group', 'cityFilter'] });

  test('the filter field restricts access', async () => {
    const result = await run(schema, { roles: ['user'], id: ids.userInKyivGroup });

    expect(result).toEqual({ data: cityNames(['Kyiv']) });
  });

  test('no access if the filter field is not set', async () => {
    const result = await run(schema, { roles: ['user'], id: ids.userInGroupWithoutFilter });

    expect(result).toEqual({ data: cityNames([]) });
  });

  test('no access if the pointer is not set', async () => {
    const result = await run(schema, { roles: ['user'], id: ids.userKyiv });

    expect(result).toEqual({ data: cityNames([]) });
  });

  test('no access if there is no record the pointer points to', async () => {
    const result = await run(schema, { roles: ['user'], id: ids.userInAbsentGroup });

    expect(result).toEqual({ data: cityNames([]) });
  });

  test('no access if there is no User record with "id"', async () => {
    const result = await run(schema, { roles: ['user'], id: absentId });

    expect(result).toEqual({ data: cityNames([]) });
  });
});
