/* eslint-env jest */
import type { SimplifiedEntityConfig, TangibleEntityConfig } from '@/tsTypes';

import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import getCommonManyData from './getCommonData';

// in-memory "collections" whose "find" returns documents in reversed order (as mongodb may do)
const collections: Record<string, any[]> = {};

jest.mock('@/mongooseModels/createMongooseModel', () => ({
  __esModule: true,
  default: jest.fn(async (mongooseConn, { name }) => {
    const matches = (doc, where) =>
      Object.keys(where).every((key) => {
        const value = where[key];

        if (key === '$or') {
          return value.some((subWhere) => matches(doc, subWhere));
        }

        if (value && value.$in) {
          return value.$in.map(String).includes(doc[key].toString());
        }

        if (value && value.$eq !== undefined) {
          return doc[key].toString() === value.$eq.toString();
        }

        return doc[key].toString() === value.toString();
      });

    return {
      findOne: async (where) => collections[name].find((doc) => matches(doc, where)) || null,
      find: async (where) => collections[name].filter((doc) => matches(doc, where)).reverse(),
    };
  }),
}));

const id = (n: number) => `00000000000000000000000${n}`;

describe('getCommonData of copyManyEntities (B19)', () => {
  const simplifiedEntityConfigs: SimplifiedEntityConfig[] = [
    {
      name: 'Person',
      textFields: [{ name: 'firstName' }],
      duplexFields: [
        { name: 'clone', oppositeName: 'original', configName: 'PersonClone' },
        { name: 'backups', array: true, oppositeName: 'original', configName: 'PersonBackup' },
      ],
    },
    {
      name: 'PersonClone',
      textFields: [{ name: 'firstName' }],
      duplexFields: [{ name: 'original', oppositeName: 'clone', configName: 'Person' }],
    },
    {
      name: 'PersonBackup',
      textFields: [{ name: 'firstName' }],
      duplexFields: [{ name: 'original', oppositeName: 'backups', configName: 'Person' }],
    },
  ];

  const allEntityConfigs = composeAllEntityConfigs(simplifiedEntityConfigs);
  const generalConfig = { allEntityConfigs };

  beforeEach(() => {
    collections.Person = [
      { _id: id(1), firstName: 'Ann', clone: id(3), backups: [id(5)] },
      { _id: id(2), firstName: 'Bob', clone: id(4), backups: [id(6)] },
    ];
    collections.PersonClone = [
      { _id: id(3), firstName: 'old Ann', original: id(1) },
      { _id: id(4), firstName: 'old Bob', original: id(2) },
    ];
    collections.PersonBackup = [
      { _id: id(5), firstName: 'old Ann', original: id(1) },
      { _id: id(6), firstName: 'old Bob', original: id(2) },
    ];
  });

  test('should match sources with their targets in order of "whereSource" (scalar opposite)', async () => {
    const result = await getCommonManyData(
      {
        entityConfig: allEntityConfigs.PersonClone as TangibleEntityConfig,
        generalConfig,
        serversideConfig: {},
      },
      {
        args: { whereSource: [{ original: { id: id(1) } }, { original: { id: id(2) } }] },
        context: { mongooseConn: {} },
      } as any,
      null,
    );

    // pairs: [target, source data]
    expect(result?.map(({ _id, firstName }) => [_id && _id.toString(), firstName])).toEqual([
      [id(3), 'old Ann'],
      [undefined, 'Ann'],
      [id(4), 'old Bob'],
      [undefined, 'Bob'],
    ]);
  });

  test('should match sources with "whereKeyToTarget" items by index (array opposite)', async () => {
    const result = await getCommonManyData(
      {
        entityConfig: allEntityConfigs.PersonBackup as TangibleEntityConfig,
        generalConfig,
        serversideConfig: {},
      },
      {
        args: {
          whereSource: [{ original: { id: id(1) } }, { original: { id: id(2) } }],
          whereKeyToTarget: [{ id: id(5) }, { id: id(6) }],
        },
        context: { mongooseConn: {} },
      } as any,
      null,
    );

    expect(result?.map(({ _id, firstName }) => [_id && _id.toString(), firstName])).toEqual([
      [id(5), 'old Ann'],
      [undefined, 'Ann'],
      [id(6), 'old Bob'],
      [undefined, 'Bob'],
    ]);
  });
});
