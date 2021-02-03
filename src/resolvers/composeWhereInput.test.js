// @flow
/* eslint-env jest */

import type { ThingConfig } from '../flowTypes';

import composeWhereInput from './composeWhereInput';

describe('composeWhereInput', () => {
  const thingConfig: ThingConfig = {};
  Object.assign(thingConfig, {
    name: 'Example',
    textFields: [
      {
        name: 'name',
        index: true,
      },
      {
        name: 'code',
        index: true,
      },
      {
        name: 'code2',
        index: true,
      },
    ],
    floatFields: [
      {
        name: 'floatField',
        index: true,
      },
      {
        name: 'floatField2',
        index: true,
      },
    ],
    intFields: [
      {
        name: 'intField',
        index: true,
      },
      {
        name: 'intField2',
        index: true,
      },
    ],
    relationalFields: [
      {
        name: 'relationalField',
        index: true,
        config: thingConfig,
      },
    ],
  });

  test('should return {}', () => {
    const where = undefined;

    const expectedResult = { where: {}, lookups: [] };
    const result = composeWhereInput(where, thingConfig);

    expect(result).toEqual(expectedResult);
  });

  test('should return {} 2', () => {
    const where = {};

    const expectedResult = { where: {}, lookups: [] };
    const result = composeWhereInput(where, thingConfig);

    expect(result).toEqual(expectedResult);
  });

  test('should return result for flat data', () => {
    const where = {
      name: 'Вася',
      code_in: ['Vasya-1', 'Vasya-2', 'Vasya-3'],
      code2_re: [{ pattern: 'Misha' }, { pattern: 'sash', flags: 'i' }],
      floatField_gt: 77.3,
      floatField2_gte: 180.0,
      intField_lt: 15,
      intField2_lte: 20,
      relationalField: null,
    };

    const result = composeWhereInput(where, thingConfig);
    const expectedResult = {
      where: {
        name: 'Вася',
        code: { $in: ['Vasya-1', 'Vasya-2', 'Vasya-3'] },
        code2: { $in: [/Misha/, /sash/i] },
        floatField: { $gt: 77.3 },
        floatField2: { $gte: 180.0 },
        intField: { $lt: 15 },
        intField2: { $lte: 20 },
        relationalField: null,
      },
      lookups: [],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return result for hierarchical data', () => {
    const where = {
      OR: [
        {
          AND: [
            { name: 'Вася' },
            { code2_nin: ['Misha-1', 'Misha-2', 'Misha-3'] },
            { floatField_gt: 77.3 },
          ],
        },
        {
          AND: [
            {
              floatField2_gte: 180.0,
            },
            {
              intField_lt: 15,
            },
            {
              intField2_lte: 20,
            },
          ],
        },
      ],
    };

    const result = composeWhereInput(where, thingConfig);
    const expectedResult = {
      where: {
        $or: [
          {
            $and: [
              { name: 'Вася' },
              { code2: { $nin: ['Misha-1', 'Misha-2', 'Misha-3'] } },
              { floatField: { $gt: 77.3 } },
            ],
          },
          {
            $and: [
              { floatField2: { $gte: 180.0 } },
              { intField: { $lt: 15 } },
              { intField2: { $lte: 20 } },
            ],
          },
        ],
      },
      lookups: [],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return result for flat data', () => {
    const where = {
      relationalField__name: 'Вася',
      relationalField__code_in: ['Vasya-1', 'Vasya-2', 'Vasya-3'],
      relationalField__code2_re: [{ pattern: 'Misha' }, { pattern: 'sash', flags: 'i' }],
      relationalField__floatField_gt: 77.3,
      relationalField__floatField2_gte: 180.0,
      relationalField__intField_lt: 15,
      relationalField__intField2_lte: 20,
    };

    const result = composeWhereInput(where, thingConfig);
    const expectedResult = {
      where: {
        'relationalField_.name': 'Вася',
        'relationalField_.code': { $in: ['Vasya-1', 'Vasya-2', 'Vasya-3'] },
        'relationalField_.code2': { $in: [/Misha/, /sash/i] },
        'relationalField_.floatField': { $gt: 77.3 },
        'relationalField_.floatField2': { $gte: 180.0 },
        'relationalField_.intField': { $lt: 15 },
        'relationalField_.intField2': { $lte: 20 },
      },
      lookups: [
        {
          $lookup: {
            from: 'example_things',
            localField: 'relationalField',
            foreignField: '_id',
            as: 'relationalField_',
          },
        },
      ],
    };

    expect(result).toEqual(expectedResult);
  });
});
