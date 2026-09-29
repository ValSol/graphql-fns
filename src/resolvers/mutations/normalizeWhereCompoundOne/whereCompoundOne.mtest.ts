import mongoose from 'mongoose';
import { graphql, printSchema } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import type {
  GeneralConfig,
  RepresentationAttributes,
  SimplifiedEntityConfig,
  TangibleEntityConfig,
} from '@/tsTypes';

import mongoOptions from '@/test/mongo-options';
import createMongooseModel from '@/mongooseModels/createMongooseModel';
import pubsub from '@/resolvers/utils/pubsub';
import fromGlobalId from '@/resolvers/utils/fromGlobalId';
import toGlobalId from '@/resolvers/utils/toGlobalId';
import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import composeTypeDefsAndResolvers from '@/composeTypeDefsAndResolvers';
import workOutMutations from '../workOutMutations';

// "whereCompoundOne" (and "whereCompoundTarget" of "copy…") in mutations: through the GraphQL schema
// (global ids, representations) and through "workOutMutations" (mongo ids, "lockedData")

const declarations: SimplifiedEntityConfig[] = [
  {
    name: 'Country',
    type: 'tangible',
    textFields: [{ name: 'code', unique: true }],
  },
  {
    name: 'City',
    type: 'tangible',
    uniqueCompoundIndexes: [
      ['name', 'country'],
      ['postcode', 'country'],
    ],
    textFields: [{ name: 'name' }, { name: 'postcode' }, { name: 'tags', array: true }],
    intFields: [{ name: 'population' }],
    relationalFields: [{ name: 'country', oppositeName: 'cities', configName: 'Country' }],
    // a child entity to have "delete…WithChildren" mutations
    duplexFields: [
      {
        name: 'districts',
        oppositeName: 'city',
        array: true,
        configName: 'District',
        parent: true,
      },
    ],
  },
  {
    name: 'District',
    type: 'tangible',
    textFields: [{ name: 'name' }],
    duplexFields: [{ name: 'city', oppositeName: 'districts', configName: 'City' }],
  },
  {
    name: 'Person',
    type: 'tangible',
    textFields: [{ name: 'firstName' }, { name: 'lastName' }],
    duplexFields: [
      { name: 'backups', oppositeName: 'original', array: true, configName: 'PersonBackup' },
    ],
  },
  {
    name: 'PersonBackup',
    type: 'tangible',
    uniqueCompoundIndexes: [['lastName', 'original']],
    textFields: [{ name: 'firstName' }, { name: 'lastName' }],
    duplexFields: [{ name: 'original', oppositeName: 'backups', configName: 'Person' }],
  },
];

const allEntityConfigs = composeAllEntityConfigs(declarations);

const ForCatalog: RepresentationAttributes = {
  representationKey: 'ForCatalog',
  allow: {
    City: ['entity', 'childEntities', 'updateEntity', 'updateManyEntities', 'deleteEntity'],
    Country: ['childEntity'],
  },
  excludeFields: { City: ['districts'] },
};

// "country" is in both indexes, so no index is left
const ForMap: RepresentationAttributes = {
  representationKey: 'ForMap',
  allow: { City: ['entity', 'updateEntity'] },
  excludeFields: { City: ['country', 'districts'] },
};

const generalConfig: GeneralConfig = {
  allEntityConfigs,
  representations: { ForCatalog, ForMap },
};

const { typeDefs, resolvers } = composeTypeDefsAndResolvers(generalConfig, {});

const schema = makeExecutableSchema({ typeDefs, resolvers });

let mongooseConn;

const run = async (source: string) => {
  const { data, errors } = await graphql({
    schema,
    source,
    contextValue: { mongooseConn, pubsub },
  });

  return { data, errors: errors?.map(({ message }) => message) };
};

const mongoId = (globalId: string) => fromGlobalId(globalId)._id.toString();

const byId = <T extends { id: string }>(items: T[]) =>
  [...items].sort(({ id: a }, { id: b }) => (a < b ? -1 : 1));

mongoose.set('strictQuery', false);

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-where-compound-one-mutations';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  for (const entityName of ['City', 'PersonBackup']) {
    const Entity = await createMongooseModel(mongooseConn, allEntityConfigs[entityName]);
    await Entity.createCollection();
    await Entity.syncIndexes();
  }
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

describe('whereCompoundOne in mutations', () => {
  let ua: string;
  let pl: string;

  const createCity = async (fields: string) => {
    const { data, errors } = await run(`mutation { createCity(data: { ${fields} }) { id } }`);

    expect(errors).toBeUndefined();

    return (data as any).createCity.id as string;
  };

  beforeAll(async () => {
    const { data } = await run(`mutation {
      ua: createCountry(data: { code: "UA" }) { id }
      pl: createCountry(data: { code: "PL" }) { id }
    }`);

    ({
      ua: { id: ua },
      pl: { id: pl },
    } = data as any);
  });

  test('SDL: whereOne is optional, whereCompoundOne has only fields of uniqueCompoundIndexes', () => {
    const sdl = printSchema(schema);

    expect(sdl).toContain(`input CityWhereCompoundOneInput {
  name: String
  postcode: String
  country: ID
}`);
    expect(sdl).toContain(`input PersonBackupWhereCompoundOneInput {
  lastName: String
  original: ID
}`);

    [
      'updateCity(whereOne: CityWhereOneInput, whereCompoundOne: CityWhereCompoundOneInput, data: CityUpdateInput!, token: String): City!',
      'deleteCity(whereOne: CityWhereOneInput, whereCompoundOne: CityWhereCompoundOneInput, token: String): City!',
      'pushIntoCity(whereOne: CityWhereOneInput, whereCompoundOne: CityWhereCompoundOneInput, data: PushIntoCityInput!, positions: CityPushPositionsInput, token: String): City!',
      'updateManyCities(whereOne: [CityWhereOneInput!], whereCompoundOne: [CityWhereCompoundOneInput!], data: [CityUpdateInput!]!, token: String): [City!]!',
      'deleteManyCities(whereOne: [CityWhereOneInput!], whereCompoundOne: [CityWhereCompoundOneInput!], token: String): [City!]!',
      'updateCityForCatalog(whereOne: CityForCatalogWhereOneInput, whereCompoundOne: CityForCatalogWhereCompoundOneInput, data: CityForCatalogUpdateInput!, token: String): CityForCatalog!',
      'updateManyCitiesForCatalog(whereOne: [CityForCatalogWhereOneInput!], whereCompoundOne: [CityForCatalogWhereCompoundOneInput!], data: [CityForCatalogUpdateInput!]!, token: String): [CityForCatalog!]!',
      // a representation without fields of indexes has no "uniqueCompoundIndexes"
      'CityForMap(whereOne: CityForMapWhereOneInput!, token: String): CityForMap',
      'updateCityForMap(whereOne: CityForMapWhereOneInput!, data: CityForMapUpdateInput!, token: String): CityForMap!',
      // an entity without "uniqueCompoundIndexes" keeps required "whereOne"
      'updatePerson(whereOne: PersonWhereOneInput!, data: PersonUpdateInput!, token: String): Person!',
      'deleteManyPeople(whereOne: [PersonWhereOneInput!]!, token: String): [Person!]!',
    ].forEach((signature) => {
      expect(sdl).toContain(signature);
    });

    expect(sdl).toMatch(
      /deleteCityWithChildren\(whereOne: CityWhereOneInput, whereCompoundOne: CityWhereCompoundOneInput, /,
    );
    expect(sdl).toMatch(
      /deleteManyCitiesWithChildren\(whereOne: \[CityWhereOneInput!\], whereCompoundOne: \[CityWhereCompoundOneInput!\], /,
    );
    expect(sdl).toMatch(
      /copyPersonBackup\(.*whereTarget: PersonBackupWhereOneInput, whereCompoundTarget: PersonBackupWhereCompoundOneInput, /,
    );
    expect(sdl).toMatch(
      /copyManyPersonBackups\(.*whereTarget: \[PersonBackupWhereOneInput!\], whereCompoundTarget: \[PersonBackupWhereCompoundOneInput!\], /,
    );

    expect(sdl).not.toMatch(/WhereCompoundOneInput \{[^}]*_exists/);
  });

  test('updateCity / pushIntoCity / deleteCity by whereCompoundOne', async () => {
    const kyiv = await createCity(`name: "Kyiv", postcode: "01001", country: { connect: "${ua}" }`);
    const lviv = await createCity(`name: "Lviv", postcode: "79000", country: { connect: "${ua}" }`);
    const lvivPl = await createCity(
      `name: "Lviv", postcode: "79001", country: { connect: "${pl}" }`,
    );
    const atlantis = await createCity('name: "Atlantis"');

    // relational field of the index as a global id
    const r1 = await run(`mutation {
      updateCity(whereCompoundOne: { name: "Kyiv", country: "${ua}" }, data: { population: 3 }) {
        id population country { id }
      }
    }`);
    expect(r1.errors).toBeUndefined();
    expect(r1.data).toEqual({ updateCity: { id: kyiv, population: 3, country: { id: ua } } });

    // the same name in other country
    const r2 = await run(`mutation {
      updateCity(whereCompoundOne: { name: "Lviv", country: "${pl}" }, data: { population: 1 }) { id }
    }`);
    expect(r2.data).toEqual({ updateCity: { id: lvivPl } });

    // the second index
    const r3 = await run(`mutation {
      pushIntoCity(whereCompoundOne: { postcode: "79000", country: "${ua}" }, data: { tags: ["old"] }) { id tags }
    }`);
    expect(r3.errors).toBeUndefined();
    expect(r3.data).toEqual({ pushIntoCity: { id: lviv, tags: ['old'] } });

    // "null" matches an absent value
    const r4 = await run(`mutation {
      updateCity(whereCompoundOne: { name: "Atlantis", country: null }, data: { population: 0 }) { id }
    }`);
    expect(r4.data).toEqual({ updateCity: { id: atlantis } });

    // representation
    const r5 = await run(`mutation {
      updateCityForCatalog(whereCompoundOne: { name: "Kyiv", country: "${ua}" }, data: { population: 4 }) { id population }
    }`);
    expect(r5.errors).toBeUndefined();
    expect(mongoId((r5.data as any).updateCityForCatalog.id)).toBe(mongoId(kyiv));
    expect((r5.data as any).updateCityForCatalog.population).toBe(4);

    const r6 = await run(`mutation {
      deleteCity(whereCompoundOne: { name: "Atlantis", country: null }) { id }
    }`);
    expect(r6.data).toEqual({ deleteCity: { id: atlantis } });

    const r7 = await run(`query { City(whereOne: { id: "${atlantis}" }) { id } }`);
    expect(r7.data).toEqual({ City: null });
  });

  test('not found by whereCompoundOne is the same as not found by whereOne', async () => {
    const absentId = toGlobalId(new mongoose.Types.ObjectId().toString(), 'City');

    const byWhereOne = await run(`mutation {
      updateCity(whereOne: { id: "${absentId}" }, data: { population: 1 }) { id }
    }`);
    const byWhereCompoundOne = await run(`mutation {
      updateCity(whereCompoundOne: { name: "Absent", country: "${ua}" }, data: { population: 1 }) { id }
    }`);

    expect(byWhereOne.errors).toHaveLength(1);
    expect(byWhereCompoundOne).toEqual(byWhereOne);

    const deleteByWhereOne = await run(
      `mutation { deleteCity(whereOne: { id: "${absentId}" }) { id } }`,
    );
    const deleteByWhereCompoundOne = await run(`mutation {
      deleteCity(whereCompoundOne: { name: "Absent", country: "${ua}" }) { id }
    }`);

    expect(deleteByWhereOne.errors).toHaveLength(1);
    expect(deleteByWhereCompoundOne).toEqual(deleteByWhereOne);
  });

  test('incorrect whereOne / whereCompoundOne', async () => {
    const both = await run(`mutation {
      updateCity(
        whereOne: { id: "${toGlobalId(new mongoose.Types.ObjectId().toString(), 'City')}" }
        whereCompoundOne: { name: "Kyiv", country: "${ua}" }
        data: { population: 1 }
      ) { id }
    }`);
    expect(both.errors).toEqual([
      'Expected exactly one input from "whereOne" && "whereCompoundOne"!',
    ]);

    const none = await run('mutation { updateCity(data: { population: 1 }) { id } }');
    expect(none.errors).toEqual(['Expected "whereCompoundOne" or "whereOne" input!']);

    const noneMany = await run('mutation { deleteManyCities { id } }');
    expect(noneMany.errors).toEqual(['Expected "whereCompoundOne" or "whereOne" input!']);

    const incomplete = await run(`mutation {
      updateCity(whereCompoundOne: { name: "Kyiv" }, data: { population: 1 }) { id }
    }`);
    expect(incomplete.errors?.[0]).toMatch(/^Got "whereCompoundOne" keys: \["name"\]/);

    const twoIndexes = await run(`mutation {
      deleteCity(whereCompoundOne: { name: "Kyiv", postcode: "01001", country: "${ua}" }) { id }
    }`);
    expect(twoIndexes.errors?.[0]).toMatch(/^Got "whereCompoundOne" keys/);

    const exists = await run(`mutation {
      deleteCity(whereCompoundOne: { name: "Kyiv", country_exists: true }) { id }
    }`);
    expect(exists.errors?.[0]).toMatch(/not to include unknown field "country_exists"/);
  });

  test('updateManyCities / deleteManyCities by whereCompoundOne', async () => {
    const odesa = await createCity(
      `name: "Odesa", postcode: "65000", country: { connect: "${ua}" }`,
    );
    const krakow = await createCity(
      `name: "Krakow", postcode: "30000", country: { connect: "${pl}" }`,
    );
    const dnipro = await createCity(
      `name: "Dnipro", postcode: "49000", country: { connect: "${ua}" }`,
    );

    // different indexes in one array (results of "…Many…" are in the order of the db, as for "whereOne")
    const r1 = await run(`mutation {
      updateManyCities(
        whereCompoundOne: [
          { postcode: "30000", country: "${pl}" }
          { name: "Odesa", country: "${ua}" }
        ]
        data: [{ population: 30 }, { population: 65 }]
      ) { id population }
    }`);
    expect(r1.errors).toBeUndefined();
    expect(byId((r1.data as any).updateManyCities)).toEqual(
      byId([
        { id: krakow, population: 30 },
        { id: odesa, population: 65 },
      ]),
    );

    const r2 = await run(`mutation {
      updateManyCitiesForCatalog(
        whereCompoundOne: [{ name: "Odesa", country: "${ua}" }]
        data: [{ population: 66 }]
      ) { id population }
    }`);
    expect(r2.errors).toBeUndefined();
    expect(mongoId((r2.data as any).updateManyCitiesForCatalog[0].id)).toBe(mongoId(odesa));

    const lengths = await run(`mutation {
      updateManyCities(whereCompoundOne: [{ name: "Odesa", country: "${ua}" }], data: []) { id }
    }`);
    expect(lengths.errors?.[0]).toMatch(/^Length of whereOne is "1", length of data is "0"/);

    // one item is not found: nothing is changed, as for "whereOne"
    const notFound = await run(`mutation {
      updateManyCities(
        whereCompoundOne: [{ name: "Odesa", country: "${ua}" }, { name: "Absent", country: "${ua}" }]
        data: [{ population: 0 }, { population: 0 }]
      ) { id }
    }`);
    const absentId = toGlobalId(new mongoose.Types.ObjectId().toString(), 'City');
    const notFoundByWhereOne = await run(`mutation {
      updateManyCities(
        whereOne: [{ id: "${odesa}" }, { id: "${absentId}" }]
        data: [{ population: 0 }, { population: 0 }]
      ) { id }
    }`);
    expect(notFound.errors).toHaveLength(1);
    expect(notFound).toEqual(notFoundByWhereOne);

    const odesaNow = await run(`query { City(whereOne: { id: "${odesa}" }) { population } }`);
    expect(odesaNow.data).toEqual({ City: { population: 66 } });

    const r3 = await run(`mutation {
      deleteManyCities(
        whereCompoundOne: [{ name: "Dnipro", country: "${ua}" }, { postcode: "30000", country: "${pl}" }]
      ) { id }
    }`);
    expect(r3.errors).toBeUndefined();
    expect(byId((r3.data as any).deleteManyCities)).toEqual(byId([{ id: dnipro }, { id: krakow }]));

    const r4 = await run(`mutation {
      deleteManyCitiesWithChildren(whereCompoundOne: [{ name: "Odesa", country: "${ua}" }]) { id }
    }`);
    expect(r4.errors).toBeUndefined();
    expect(r4.data).toEqual({ deleteManyCitiesWithChildren: [{ id: odesa }] });

    const kharkiv = await createCity(
      `name: "Kharkiv", postcode: "61000", country: { connect: "${ua}" }, districts: { create: [{ name: "Saltivka" }] }`,
    );
    const r5 = await run(`mutation {
      deleteCityWithChildren(whereCompoundOne: { name: "Kharkiv", country: "${ua}" }) { id }
    }`);
    expect(r5.errors).toBeUndefined();
    expect(r5.data).toEqual({ deleteCityWithChildren: { id: kharkiv } });

    const districts = await run('query { Districts { id } }');
    expect(districts.data).toEqual({ Districts: [] });
  });

  test('copyPersonBackup / copyManyPersonBackups by whereCompoundTarget', async () => {
    const { data } = await run(`mutation {
      hugo: createPerson(data: { firstName: "Hugo", lastName: "Boss" }) { id }
      coco: createPerson(data: { firstName: "Coco", lastName: "Chanel" }) { id }
    }`);
    const {
      hugo: { id: hugo },
      coco: { id: coco },
    } = data as any;

    const created = await run(`mutation {
      hugoBackup: copyPersonBackup(whereKeyToSource: { original: { id: "${hugo}" } }) { id }
      cocoBackup: copyPersonBackup(whereKeyToSource: { original: { id: "${coco}" } }) { id }
    }`);
    expect(created.errors).toBeUndefined();
    const {
      hugoBackup: { id: hugoBackup },
      cocoBackup: { id: cocoBackup },
    } = created.data as any;

    await run(`mutation {
      updateManyPeople(
        whereOne: [{ id: "${hugo}" }, { id: "${coco}" }]
        data: [{ firstName: "Hugo2" }, { firstName: "Coco2" }]
      ) { id }
    }`);

    // duplex field of the index as a global id
    const r1 = await run(`mutation {
      copyPersonBackup(
        whereKeyToSource: { original: { id: "${hugo}" } }
        whereCompoundTarget: { lastName: "Boss", original: "${hugo}" }
      ) { id firstName }
    }`);
    expect(r1.errors).toBeUndefined();
    expect(r1.data).toEqual({ copyPersonBackup: { id: hugoBackup, firstName: 'Hugo2' } });

    await run(`mutation {
      updateManyPeople(
        whereOne: [{ id: "${hugo}" }, { id: "${coco}" }]
        data: [{ firstName: "Hugo3" }, { firstName: "Coco3" }]
      ) { id }
    }`);

    const r2 = await run(`mutation {
      copyManyPersonBackups(
        whereKeyToSource: [{ original: { id: "${coco}" } }, { original: { id: "${hugo}" } }]
        whereCompoundTarget: [
          { lastName: "Chanel", original: "${coco}" }
          { lastName: "Boss", original: "${hugo}" }
        ]
      ) { id firstName }
    }`);
    expect(r2.errors).toBeUndefined();
    expect(byId((r2.data as any).copyManyPersonBackups)).toEqual(
      byId([
        { id: cocoBackup, firstName: 'Coco3' },
        { id: hugoBackup, firstName: 'Hugo3' },
      ]),
    );

    const both = await run(`mutation {
      copyPersonBackup(
        whereKeyToSource: { original: { id: "${hugo}" } }
        whereTarget: { id: "${hugoBackup}" }
        whereCompoundTarget: { lastName: "Boss", original: "${hugo}" }
      ) { id }
    }`);
    expect(both.errors).toEqual([
      'Expected exactly one input from "whereTarget" && "whereCompoundTarget"!',
    ]);

    const notFound = await run(`mutation {
      copyPersonBackup(
        whereKeyToSource: { original: { id: "${hugo}" } }
        whereCompoundTarget: { lastName: "Absent", original: "${hugo}" }
      ) { id }
    }`);
    expect(notFound.errors?.[0]).toMatch(/^Not found "PersonBackup" entity to copy to: /);
  });

  test('workOutMutations: whereCompoundOne with mongo ids and lockedData', async () => {
    const cityConfig = allEntityConfigs.City as TangibleEntityConfig;
    const context = { mongooseConn, pubsub };
    const commonResolverCreatorArg = { generalConfig, serversideConfig: {}, context };

    const lutsk = await createCity(
      `name: "Lutsk", postcode: "43000", country: { connect: "${ua}" }`,
    );
    const uaMongoId = mongoId(ua);

    const whereCompoundOne = { name: 'Lutsk', country: uaMongoId };

    const [city] = await workOutMutations(
      [
        {
          actionGeneralName: 'updateEntity',
          entityConfig: cityConfig,
          args: { whereCompoundOne, data: { population: 1 } },
          returnResult: true,
          lockedData: { args: { whereCompoundOne }, result: { population: null } },
        },
      ],
      commonResolverCreatorArg,
    );
    expect(city.id.toString()).toBe(mongoId(lutsk));
    expect(city.population).toBe(1);

    // "lockedData" is checked by "whereCompoundOne" too
    await expect(
      workOutMutations(
        [
          {
            actionGeneralName: 'updateEntity',
            entityConfig: cityConfig,
            args: { whereCompoundOne, data: { population: 2 } },
            returnResult: true,
            lockedData: { args: { whereCompoundOne }, result: { population: 0 } },
          },
        ],
        commonResolverCreatorArg,
      ),
    ).rejects.toThrow(/^Got current result.population = "1"/);
  });
});
