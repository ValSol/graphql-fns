// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../../flowTypes';

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
      {
        name: 'intField3',
        index: true,
      },
      {
        name: 'intFields',
        index: true,
        array: true,
      },
      {
        name: 'intFields2',
        index: true,
        array: true,
      },
    ],
    relationalFields: [
      {
        name: 'relationalField',
        index: true,
        config: thingConfig,
      },
      {
        name: 'relationalFields',
        index: true,
        config: thingConfig,
        array: true,
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

  test('should return replace _id ', () => {
    const where = { id: '6096802438f0d5bb46164881' };

    const expectedResult = { where: { _id: '6096802438f0d5bb46164881' }, lookups: [] };
    const notCreateObjectId = true;
    const result = composeWhereInput(where, thingConfig, notCreateObjectId);

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
      intField_gt: 10,
      intField2_lte: 20,
      intField3_exists: true,
      intFields_size: 1,
      intFields2_notsize: 0,
      relationalField: null,
      relationalFields_size: 1,
    };

    const result = composeWhereInput(where, thingConfig);
    const expectedResult = {
      where: {
        name: { $eq: 'Вася' },
        code: { $in: ['Vasya-1', 'Vasya-2', 'Vasya-3'] },
        code2: { $in: [/Misha/, /sash/i] },
        floatField: { $gt: 77.3 },
        floatField2: { $gte: 180.0 },
        intField: { $lt: 15, $gt: 10 },
        intField2: { $lte: 20 },
        intField3: { $exists: true },
        intFields: { $size: 1 },
        intFields2: { $not: { $size: 0 } },
        relationalField: null,
        relationalFields: { $size: 1 },
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
            {
              intField3_exists: false,
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
              { name: { $eq: 'Вася' } },
              { code2: { $nin: ['Misha-1', 'Misha-2', 'Misha-3'] } },
              { floatField: { $gt: 77.3 } },
            ],
          },
          {
            $and: [
              { floatField2: { $gte: 180.0 } },
              { intField: { $lt: 15 } },
              { intField2: { $lte: 20 } },
              { intField3: { $exists: false } },
            ],
          },
        ],
      },
      lookups: [],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return result for relational where', () => {
    const where = {
      relationalField_: {
        name: 'Вася',
        code_in: ['Vasya-1', 'Vasya-2', 'Vasya-3'],
        code2_re: [{ pattern: 'Misha' }, { pattern: 'sash', flags: 'i' }],
        floatField_gt: 77.3,
        floatField2_gte: 180.0,
        intField_lt: 15,
        intField2_lte: 20,
        intField3_exists: true,
      },
    };

    const result = composeWhereInput(where, thingConfig);
    const expectedResult = {
      where: {
        'relationalField_.name': { $eq: 'Вася' },
        'relationalField_.code': { $in: ['Vasya-1', 'Vasya-2', 'Vasya-3'] },
        'relationalField_.code2': { $in: [/Misha/, /sash/i] },
        'relationalField_.floatField': { $gt: 77.3 },
        'relationalField_.floatField2': { $gte: 180.0 },
        'relationalField_.intField': { $lt: 15 },
        'relationalField_.intField2': { $lte: 20 },
        'relationalField_.intField3': { $exists: true },
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

  test('should return result for tree for relational where', () => {
    const menusectionConfig: ThingConfig = {};
    const menuConfig: ThingConfig = {};
    const restaurantConfig: ThingConfig = {};

    const accessConfig = {
      name: 'Access',

      textFields: [
        {
          name: 'restaurantEditors',
          index: true,
          array: true,
        },
      ],
    };

    Object.assign(menusectionConfig, {
      name: 'Menusection',
      duplexFields: [
        {
          name: 'menu',
          oppositeName: 'sections',
          config: menuConfig,
          required: true,
          index: true,
        },
      ],
    });

    Object.assign(menuConfig, {
      name: 'Menu',
      duplexFields: [
        {
          name: 'sections',
          oppositeName: 'menu',
          array: true,
          config: menusectionConfig,
          required: true,
          index: true,
        },
        {
          name: 'restaurant',
          oppositeName: 'menu',
          config: restaurantConfig,
          required: true,
          index: true,
        },
      ],
    });

    Object.assign(restaurantConfig, {
      name: 'Restaurant',
      duplexFields: [
        {
          name: 'menu',
          oppositeName: 'restaurant',
          config: menuConfig,
          index: true,
        },
      ],

      relationalFields: [
        {
          name: 'access',
          config: accessConfig,
          index: true,
        },
      ],
    });

    const where = {
      menu_: {
        restaurant_: {
          access_: {
            restaurantEditors: '5f85ad539905d61fb73346a2',
          },
        },
      },
    };

    const result = composeWhereInput(where, menusectionConfig);
    const expectedResult = {
      where: {
        'menu_restaurant_access_.restaurantEditors': { $eq: '5f85ad539905d61fb73346a2' },
      },
      lookups: [
        {
          $lookup: {
            from: 'menu_things',
            localField: 'menu',
            foreignField: '_id',
            as: 'menu_',
          },
        },
        {
          $lookup: {
            from: 'restaurant_things',
            localField: 'menu_.restaurant',
            foreignField: '_id',
            as: 'menu_restaurant_',
          },
        },
        {
          $lookup: {
            from: 'access_things',
            localField: 'menu_restaurant_.access',
            foreignField: '_id',
            as: 'menu_restaurant_access_',
          },
        },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return result for tree for relational where', () => {
    const restaurantLevelConfig: ThingConfig = {
      name: 'RestaurantLevel',

      textFields: [
        {
          name: 'submitter',
          index: true,
          freeze: true,
        },
      ],

      intFields: [
        {
          name: 'servicePackage',
          required: true,
          index: true,
        },
        { name: 'termIndex' },
      ],
    };

    const where = {
      OR: [
        { submitter: null },
        { submitter_exists: false },
        { submitter: '5efb534ec7761f003b58646a' },
      ],
    };

    const result = composeWhereInput(where, restaurantLevelConfig);

    const expectedResult = {
      lookups: [],
      where: {
        $or: [
          {
            submitter: {
              $eq: null,
            },
          },
          {
            submitter: {
              $exists: false,
            },
          },
          {
            submitter: {
              $eq: '5efb534ec7761f003b58646a',
            },
          },
        ],
      },
    };

    expect(result).toEqual(expectedResult);
  });
});
