import mongoose from 'mongoose';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import type { GeneralConfig, SimplifiedEntityConfig } from '@/tsTypes';

import mongoOptions from '@/test/mongo-options';
import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import composeTypeDefsAndResolvers from '@/composeTypeDefsAndResolvers';

// "MultiLineString" geospatial field through the schema: "GeospatialMultiLineStringInput" in create & update

const declarations: SimplifiedEntityConfig[] = [
  {
    name: 'Route',
    type: 'tangible',
    textFields: [{ name: 'title' }],
    geospatialFields: [
      { name: 'path', geospatialType: 'MultiLineString' },
      { name: 'paths', geospatialType: 'MultiLineString', array: true },
    ],
  },
];

const allEntityConfigs = composeAllEntityConfigs(declarations);

// no subscriptions, so no "pubsub" is needed
const generalConfig: GeneralConfig = {
  allEntityConfigs,
  inventory: { name: 'G', exclude: { Subscription: true } },
};

const { typeDefs, resolvers } = composeTypeDefsAndResolvers(generalConfig, {});

const schema = makeExecutableSchema({ typeDefs, resolvers });

let mongooseConn;

const run = (source: string) => graphql({ schema, source, contextValue: { mongooseConn } });

mongoose.set('strictQuery', false);

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-multi-line-string-through-schema';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

const lineStrings = (shift: number) =>
  `{ lineStrings: [{ coordinates: [{ lng: ${shift}, lat: 1 }, { lng: ${shift}, lat: 2 }] }, { coordinates: [{ lng: ${shift + 1}, lat: 1 }, { lng: ${shift + 1}, lat: 2 }] }] }`;

const expected = (shift: number) => ({
  lineStrings: [
    {
      coordinates: [
        { lng: shift, lat: 1 },
        { lng: shift, lat: 2 },
      ],
    },
    {
      coordinates: [
        { lng: shift + 1, lat: 1 },
        { lng: shift + 1, lat: 2 },
      ],
    },
  ],
});

const selection = `id
    path { lineStrings { coordinates { lng lat } } }
    paths { lineStrings { coordinates { lng lat } } }`;

describe('MultiLineString geospatial field through schema', () => {
  test('should declare "GeospatialMultiLineStringInput"', () => {
    expect(typeDefs).toMatch(
      /\ninput GeospatialMultiLineStringInput {\n {2}lineStrings: \[GeospatialLineStringInput!\]!\n}\n/,
    );
  });

  test('should create & update entity with "MultiLineString" fields', async () => {
    const created = await run(`mutation {
  createRoute(data: { title: "A", path: ${lineStrings(10)}, paths: [${lineStrings(20)}] }) {
    ${selection}
  }
}`);

    expect(created.errors).toBeUndefined();

    const { id, path, paths } = created.data?.createRoute as any;

    expect(path).toEqual(expected(10));
    expect(paths).toEqual([expected(20)]);

    const updated = await run(`mutation {
  updateRoute(whereOne: { id: "${id}" }, data: { path: ${lineStrings(30)} }) {
    ${selection}
  }
}`);

    expect(updated.errors).toBeUndefined();
    expect((updated.data?.updateRoute as any).path).toEqual(expected(30));

    const read = await run(`{ Route(whereOne: { id: "${id}" }) { ${selection} } }`);

    expect(read.errors).toBeUndefined();
    expect((read.data?.Route as any).path).toEqual(expected(30));
    expect((read.data?.Route as any).paths).toEqual([expected(20)]);
  });
});
