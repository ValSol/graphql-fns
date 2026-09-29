import mongoose from 'mongoose';

import type { GeneralConfig, EntityConfig, TangibleEntityConfig } from '@/tsTypes';

import mongoOptions from '@/test/mongo-options';
import sleep from '@/utils/sleep';
import createThingSchema from '@/mongooseModels/createThingSchema';
import createInfoEssence from '@/resolvers/utils/createInfoEssence';
import pubsub from '@/resolvers/utils/pubsub';
import createCreateEntityMutationResolver from '@/resolvers/mutations/createCreateEntityMutationResolver';
import createEntityQueryResolver from './index';

const info = createInfoEssence({ projection: { name: 1, country: 1 } });

mongoose.set('strictQuery', false);

let mongooseConn: any;

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-entity-query-where-compound-one';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

describe('createEntityQueryResolver with "whereCompoundOne"', () => {
  const countryConfig = {} as TangibleEntityConfig;
  const cityConfig = {} as TangibleEntityConfig;

  Object.assign(countryConfig, {
    name: 'Country',
    type: 'tangible',

    textFields: [{ name: 'name', unique: true, type: 'textFields' }],

    relationalFields: [
      {
        name: 'cities',
        oppositeName: 'country',
        array: true,
        parent: true,
        config: cityConfig,
        type: 'relationalFields',
      },
    ],
  });

  Object.assign(cityConfig, {
    name: 'City',
    type: 'tangible',

    uniqueCompoundIndexes: [['name', 'country']],

    textFields: [{ name: 'name', type: 'textFields' }],

    relationalFields: [
      {
        name: 'country',
        oppositeName: 'cities',
        config: countryConfig,
        type: 'relationalFields',
      },
    ],
  });

  const generalConfig: GeneralConfig = {
    allEntityConfigs: { Country: countryConfig, City: cityConfig },
  };

  const serversideConfig: Record<string, any> = {};

  const resolverOptions = { involvedFilters: { inputOutputFilterAndLimit: [[]] } };

  test('should find entity by compound key with relational field and "null" value', async () => {
    const citySchema = createThingSchema(cityConfig as EntityConfig);
    const City = mongooseConn.model('City_Thing', citySchema);
    await City.createCollection();
    await City.syncIndexes();

    await sleep(250);

    const createCountry = createCreateEntityMutationResolver(
      countryConfig,
      generalConfig,
      serversideConfig,
    );
    const createCity = createCreateEntityMutationResolver(
      cityConfig,
      generalConfig,
      serversideConfig,
    );

    const context = { mongooseConn, pubsub };

    const { id: ukraineId } = await createCountry(
      null,
      { data: { name: 'Ukraine' } },
      context,
      null,
      resolverOptions,
    );
    const { id: polandId } = await createCountry(
      null,
      { data: { name: 'Poland' } },
      context,
      null,
      resolverOptions,
    );

    const { id: kyivId } = await createCity(
      null,
      { data: { name: 'Kyiv', country: { connect: ukraineId } } },
      context,
      null,
      resolverOptions,
    );
    const { id: lvivId } = await createCity(
      null,
      { data: { name: 'Lviv', country: { connect: ukraineId } } },
      context,
      null,
      resolverOptions,
    );
    await createCity(
      null,
      { data: { name: 'Lviv', country: { connect: polandId } } },
      context,
      null,
      resolverOptions,
    );
    const { id: atlantisId } = await createCity(
      null,
      { data: { name: 'Atlantis' } },
      context,
      null,
      resolverOptions,
    );

    const cityQuery = createEntityQueryResolver(cityConfig, generalConfig, serversideConfig);

    const kyiv = await cityQuery(
      null,
      { whereCompoundOne: { name: 'Kyiv', country: ukraineId.toString() } },
      context,
      info,
      resolverOptions,
    );
    expect(kyiv.id.toString()).toBe(kyivId.toString());

    const lviv = await cityQuery(
      null,
      { whereCompoundOne: { country: ukraineId.toString(), name: 'Lviv' } },
      context,
      info,
      resolverOptions,
    );
    expect(lviv.id.toString()).toBe(lvivId.toString());

    const atlantis = await cityQuery(
      null,
      { whereCompoundOne: { name: 'Atlantis', country: null } },
      context,
      info,
      resolverOptions,
    );
    expect(atlantis.id.toString()).toBe(atlantisId.toString());

    const notFound = await cityQuery(
      null,
      { whereCompoundOne: { name: 'Kyiv', country: polandId.toString() } },
      context,
      info,
      resolverOptions,
    );
    expect(notFound).toBeNull();

    await expect(
      cityQuery(
        null,
        { whereCompoundOne: { name: 'Atlantis', country_exists: false } },
        context,
        info,
        resolverOptions,
      ),
    ).rejects.toThrow(TypeError);

    await expect(
      cityQuery(null, { whereCompoundOne: { name: 'Kyiv' } }, context, info, resolverOptions),
    ).rejects.toThrow(TypeError);
  });
});
