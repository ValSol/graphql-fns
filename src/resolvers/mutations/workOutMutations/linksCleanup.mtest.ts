import mongoose from 'mongoose';

import type { GeneralConfig, ServersideConfig, SimplifiedEntityConfig } from '@/tsTypes';

import mongoOptions from '@/test/mongo-options';
import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import workOutMutations from './index';

// Server code that writes through "workOutMutations" keeps the referential integrity like the generated
// mutations: deleting an entity cleans the links to it, a "required" duplex reference blocks the deletion.

const declarations: SimplifiedEntityConfig[] = [
  { name: 'Currency', textFields: [{ name: 'code', unique: true }] },
  {
    name: 'Country',
    textFields: [{ name: 'code', unique: true }],
    relationalFields: [
      { name: 'currency', configName: 'Currency', oppositeName: 'countries', index: true },
      {
        name: 'neighbours',
        configName: 'Country',
        oppositeName: 'neighbourOfCountries',
        array: true,
        index: true,
      },
    ],
    duplexFields: [
      { name: 'cities', configName: 'City', oppositeName: 'country', array: true, parent: true },
    ],
  },
  {
    name: 'City',
    textFields: [{ name: 'name' }],
    duplexFields: [
      { name: 'country', configName: 'Country', oppositeName: 'cities', required: true },
    ],
  },
];

const allEntityConfigs = composeAllEntityConfigs(declarations);
const generalConfig: GeneralConfig = { allEntityConfigs };
const serversideConfig: ServersideConfig = {};

let mongooseConn;

// no "pubsub": a script has none, and without reports "workOutMutations" does not need it
const run = (standardMutationsArgs: any[]) =>
  workOutMutations(standardMutationsArgs, {
    generalConfig,
    serversideConfig,
    context: { mongooseConn },
  });

const create = async (entityName: string, data: Record<string, any>): Promise<string> => {
  const [{ id }] = await run([
    {
      actionGeneralName: 'createEntity',
      entityConfig: allEntityConfigs[entityName],
      args: { data },
      returnResult: true,
    },
  ]);

  return id;
};

const deleteEntity = (entityName: string, id: string) =>
  run([
    {
      actionGeneralName: 'deleteEntity',
      entityConfig: allEntityConfigs[entityName],
      args: { whereOne: { id } },
      returnResult: false,
    },
  ]);

const readCountry = (code: string) =>
  mongooseConn.connection.db.collection('country_things').findOne({ code });

mongoose.set('strictQuery', false);

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-work-out-mutations-links-cleanup';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe('deletions by "workOutMutations"', () => {
  test('should clean the links to the deleted entity', async () => {
    const uahId = await create('Currency', { code: 'UAH' });
    const plId = await create('Country', { code: 'PL' });
    await create('Country', {
      code: 'UA',
      currency: { connect: uahId },
      neighbours: { connect: [plId] },
    });

    const before = await readCountry('UA');

    expect(String(before.currency)).toBe(String(uahId));
    expect(before.neighbours.map(String)).toEqual([String(plId)]);

    await deleteEntity('Currency', uahId);
    await deleteEntity('Country', plId);

    const ukraine = await readCountry('UA');

    expect(ukraine.currency).toBeUndefined();
    expect(ukraine.neighbours).toEqual([]);
  });

  test('should not delete an entity with a "required" duplex reference', async () => {
    const deId = await create('Country', { code: 'DE' });
    await create('City', { name: 'Berlin', country: { connect: deId } });

    await expect(deleteEntity('Country', deId)).rejects.toThrow(
      'Try unset required field: "country" for entity: "City"!',
    );

    expect(await readCountry('DE')).not.toBeNull();
  });
});
