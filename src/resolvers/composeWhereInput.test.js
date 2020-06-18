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

  test('should return null', () => {
    const where = undefined;

    const expectedResult = null;
    const result = composeWhereInput(where, thingConfig);

    expect(result).toEqual(expectedResult);
  });

  test('should return null', () => {
    const where = {};

    const expectedResult = null;
    const result = composeWhereInput(where, thingConfig);

    expect(result).toEqual(expectedResult);
  });

  test('should return result for flat data', () => {
    const where = {
      name: 'Вася',
      code_in: ['Vasya-1', 'Vasya-2', 'Vasya-3'],
      code2_nin: ['Misha-1', 'Misha-2', 'Misha-3'],
      floatField_gt: 77.3,
      floatField2_gte: 180.0,
      intField_lt: 15,
      intField2_lte: 20,
      relationalField: null,
    };

    const result = composeWhereInput(where, thingConfig);
    const expectedResult = {
      name: 'Вася',
      code: { $in: ['Vasya-1', 'Vasya-2', 'Vasya-3'] },
      code2: { $nin: ['Misha-1', 'Misha-2', 'Misha-3'] },
      floatField: { $gt: 77.3 },
      floatField2: { $gte: 180.0 },
      intField: { $lt: 15 },
      intField2: { $lte: 20 },
      relationalField: null,
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
    };

    expect(result).toEqual(expectedResult);
  });
});
