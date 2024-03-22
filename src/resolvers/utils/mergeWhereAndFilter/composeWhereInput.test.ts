/* eslint-env jest */

import type { EntityConfig, TangibleEntityConfig } from '../../../tsTypes';

import composeWhereInput from './composeWhereInput';

describe('composeWhereInput', () => {
  const child3Config: EntityConfig = {
    name: 'Child3',
    type: 'embedded',

    textFields: [
      {
        name: 'name3',
        index: true,
        type: 'textFields',
      },
    ],
  };

  const child2Config: EntityConfig = {
    name: 'Child2',
    type: 'embedded',

    textFields: [
      {
        name: 'name2',
        index: true,
        type: 'textFields',
      },
    ],

    embeddedFields: [
      {
        name: 'embedded3',
        config: child3Config,
        index: true,
        type: 'embeddedFields',
      },
    ],
  };

  const childConfig: EntityConfig = {
    name: 'Child',
    type: 'embedded',

    textFields: [
      {
        name: 'name',
        index: true,
        type: 'textFields',
      },
    ],

    embeddedFields: [
      {
        name: 'embedded2',
        array: true,
        config: child2Config,
        index: true,
        variants: ['plain'],
        type: 'embeddedFields',
      },
    ],
  };

  const entityConfig = {} as EntityConfig;
  Object.assign(entityConfig, {
    name: 'Example',
    type: 'tangible',
    textFields: [
      {
        name: 'name',
        index: true,
        type: 'textFields',
      },
      {
        name: 'code',
        index: true,
        type: 'textFields',
      },
      {
        name: 'code2',
        index: true,
        type: 'textFields',
      },
    ],
    floatFields: [
      {
        name: 'floatField',
        index: true,
        type: 'floatFields',
      },
      {
        name: 'floatField2',
        index: true,
        type: 'floatFields',
      },
    ],
    intFields: [
      {
        name: 'intField',
        index: true,
        type: 'intFields',
      },
      {
        name: 'intField2',
        index: true,
        type: 'intFields',
      },
      {
        name: 'intField3',
        index: true,
        type: 'intFields',
      },
      {
        name: 'intFields',
        index: true,
        array: true,
        type: 'intFields',
      },
      {
        name: 'intFields2',
        index: true,
        array: true,
        type: 'intFields',
      },
    ],
    relationalFields: [
      {
        name: 'relationalField',
        oppositeName: 'parentRelationalField',
        index: true,
        config: entityConfig,
        type: 'relationalFields',
      },
      {
        name: 'parentRelationalField',
        oppositeName: 'relationalField',
        config: entityConfig,
        array: true,
        parent: true,
        type: 'relationalFields',
      },
      {
        name: 'relationalFields',
        oppositeName: 'parentRelationalFields',
        index: true,
        config: entityConfig,
        array: true,
        type: 'relationalFields',
      },
      {
        name: 'parentRelationalFields',
        oppositeName: 'relationalFields',
        config: entityConfig,
        array: true,
        parent: true,
        type: 'relationalFields',
      },
    ],

    embeddedFields: [
      {
        name: 'embedded',
        config: childConfig,
        index: true,
        type: 'embeddedFields',
      },
    ],

    geospatialFields: [
      {
        name: 'position',
        geospatialType: 'Point',
        type: 'geospatialFields',
      },
    ],
  });

  test('should return {}', () => {
    const where = undefined;

    const expectedResult = { where: {}, lookups: [] };
    const result = composeWhereInput(where, entityConfig);

    expect(result).toEqual(expectedResult);
  });

  test('should return {} 2', () => {
    const where: Record<string, any> = {};

    const expectedResult = { where: {}, lookups: [] };
    const result = composeWhereInput(where, entityConfig);

    expect(result).toEqual(expectedResult);
  });

  test('should return replace _id ', () => {
    const where = { id: '6096802438f0d5bb46164881', updatedAt_lt: '2023-09-20T08:57:04.034Z' };

    const expectedResult = {
      where: {
        _id: { $eq: '6096802438f0d5bb46164881' },
        updatedAt: { $lt: '2023-09-20T08:57:04.034Z' },
      },
      lookups: [],
    };
    const notCreateObjectId = true;
    const result = composeWhereInput(where, entityConfig, notCreateObjectId);

    expect(result).toEqual(expectedResult);
  });

  test('should return replace _id ', () => {
    const where = { OR: [{ id: '6096802438f0d5bb46164881' }] };

    const expectedResult = {
      where: { $or: [{ _id: { $eq: '6096802438f0d5bb46164881' } }] },
      lookups: [],
    };
    const notCreateObjectId = true;
    const result = composeWhereInput(where, entityConfig, notCreateObjectId);

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
      position_withinPolygon: [
        { lat: 50.42551, lng: 30.42759 },
        { lat: 50.42551, lng: 30.42761 },
        { lat: 50.42549, lng: 30.42761 },
        { lat: 50.42549, lng: 30.42759 },
        { lat: 50.42551, lng: 30.42759 },
      ],
      position_withinSphere: {
        center: { lng: 50.435766, lat: 30.515742 },
        radius: 6378100,
      },
    };

    const result = composeWhereInput(where, entityConfig);
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
        relationalField: { $eq: null },
        relationalFields: { $size: 1 },
        position: {
          $geoWithin: {
            $polygon: [
              [30.42759, 50.42551],
              [30.42761, 50.42551],
              [30.42761, 50.42549],
              [30.42759, 50.42549],
              [30.42759, 50.42551],
            ],
            $centerSphere: [[50.435766, 30.515742], 1],
          },
        },
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
            { code2_gt: 'Misha' },
            { floatField_gt: 77.3 },
          ],
        },
        {
          NOR: [
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

    const result = composeWhereInput(where, entityConfig);
    const expectedResult = {
      where: {
        $or: [
          {
            $and: [
              { name: { $eq: 'Вася' } },
              { code2: { $nin: ['Misha-1', 'Misha-2', 'Misha-3'] } },
              { code2: { $gt: 'Misha' } },
              { floatField: { $gt: 77.3 } },
            ],
          },
          {
            $nor: [
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

    const result = composeWhereInput(where, entityConfig);
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
    const menusectionConfig = {} as EntityConfig;
    const menuConfig = {} as EntityConfig;
    const restaurantConfig = {} as EntityConfig;

    const accessConfig = {
      name: 'Access',
      type: 'tangible',

      textFields: [
        {
          name: 'restaurantEditors',
          index: true,
          array: true,
          type: 'textFields',
        },
      ],
      relationalFields: [
        {
          name: 'restaurants',
          oppositeName: 'access',
          config: restaurantConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
      ],
    };

    Object.assign(menusectionConfig, {
      name: 'Menusection',
      type: 'tangible',
      duplexFields: [
        {
          name: 'menu',
          oppositeName: 'sections',
          config: menuConfig,
          required: true,
          index: true,
          type: 'duplexFields',
        },
      ],
    });

    Object.assign(menuConfig, {
      name: 'Menu',
      type: 'tangible',
      duplexFields: [
        {
          name: 'sections',
          oppositeName: 'menu',
          array: true,
          config: menusectionConfig,
          required: true,
          index: true,
          type: 'duplexFields',
        },
        {
          name: 'restaurant',
          oppositeName: 'menu',
          config: restaurantConfig,
          required: true,
          index: true,
          type: 'duplexFields',
        },
      ],
    });

    Object.assign(restaurantConfig, {
      name: 'Restaurant',
      type: 'tangible',
      duplexFields: [
        {
          name: 'menu',
          oppositeName: 'restaurant',
          config: menuConfig,
          index: true,
          type: 'duplexFields',
        },
      ],

      relationalFields: [
        {
          name: 'access',
          oppositeName: 'restaurants',
          config: accessConfig,
          index: true,
          type: 'relationalFields',
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

  test('should return result for tree for relational where backward', () => {
    const menusectionConfig = {} as TangibleEntityConfig;
    const menuConfig = {} as TangibleEntityConfig;
    const restaurantConfig = {} as TangibleEntityConfig;

    const accessConfig: TangibleEntityConfig = {
      name: 'Access',
      type: 'tangible',

      textFields: [
        {
          name: 'restaurantEditors',
          index: true,
          array: true,
          type: 'textFields',
        },
      ],
      relationalFields: [
        {
          name: 'restaurants',
          oppositeName: 'access',
          config: restaurantConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
      ],
    };

    Object.assign(menusectionConfig, {
      name: 'Menusection',
      type: 'tangible',
      relationalFields: [
        {
          name: 'menu',
          oppositeName: 'sections',
          config: menuConfig,
          required: true,
          index: true,
          type: 'relationalFields',
        },
      ],
    });

    Object.assign(menuConfig, {
      name: 'Menu',
      type: 'tangible',
      relationalFields: [
        {
          name: 'sections',
          oppositeName: 'menu',
          config: menusectionConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'restaurant',
          oppositeName: 'menus',
          config: restaurantConfig,
          required: true,
          index: true,
          type: 'relationalFields',
        },
      ],
    });

    Object.assign(restaurantConfig, {
      name: 'Restaurant',
      type: 'tangible',

      relationalFields: [
        {
          name: 'access',
          oppositeName: 'restaurants',
          config: accessConfig,
          index: true,
          type: 'relationalFields',
        },
        {
          name: 'menus',
          oppositeName: 'restaurant',
          config: menuConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
      ],
    });

    const where = {
      restaurants_: {
        menus_: {
          sections_: {
            id: '5f85ad539905d61fb73346a2',
          },
        },
      },
    };

    const result = composeWhereInput(where, accessConfig);

    const expectedWhere = {
      'restaurants_menus_sections_._id': { $eq: '5f85ad539905d61fb73346a2' },
    };
    const expectedLookups = [
      {
        $lookup: {
          from: 'restaurant_things',
          localField: '_id',
          foreignField: 'access',
          as: 'restaurants_',
        },
      },
      {
        $lookup: {
          from: 'menu_things',
          localField: 'restaurants_._id',
          foreignField: 'restaurant',
          as: 'restaurants_menus_',
        },
      },
      {
        $lookup: {
          from: 'menusection_things',
          localField: 'restaurants_menus_._id',
          foreignField: 'menu',
          as: 'restaurants_menus_sections_',
        },
      },
    ];

    expect(result.lookups).toEqual(expectedLookups);
    expect(JSON.stringify(result.where)).toEqual(JSON.stringify(expectedWhere));
  });

  test('should return result for tree for relational where 2', () => {
    const restaurantLevelConfig: EntityConfig = {
      name: 'RestaurantLevel',
      type: 'tangible',

      textFields: [
        {
          name: 'submitter',
          index: true,
          freeze: true,
          type: 'textFields',
        },
      ],

      intFields: [
        {
          name: 'servicePackage',
          required: true,
          index: true,
          type: 'intFields',
        },
        { name: 'termIndex', type: 'intFields' },
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

  test('should return result for flat data', () => {
    const where = {
      name_gt: '123456780',
    };

    const result = composeWhereInput(where, entityConfig);
    const expectedResult = {
      where: {
        name: { $gt: '123456780' },
      },
      lookups: [],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return result for "embedded" field exists', () => {
    const where = {
      embedded_exists: true,
    };

    const result = composeWhereInput(where, entityConfig);
    const expectedResult = {
      where: {
        embedded: { $exists: true },
      },
      lookups: [],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return result for "embedded" field', () => {
    const where = {
      embedded: { name: 'embedded' },
    };

    const result = composeWhereInput(where, entityConfig);
    const expectedResult = {
      where: {
        'embedded.name': { $eq: 'embedded' },
      },
      lookups: [],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return result for "embedded.embedded2.embedded3" field', () => {
    const where = {
      embedded: {
        embedded2: { embedded3: { name3_gt: 'ABC' }, name2_lt: 'XYZ', _index: 3 },
      },
    };

    const result = composeWhereInput(where, entityConfig);
    const expectedResult = {
      where: {
        'embedded.embedded2.3.embedded3.name3': { $gt: 'ABC' },
        'embedded.embedded2.3.name2': { $lt: 'XYZ' },
      },
      lookups: [],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return result for relational & embedded where', () => {
    const where = {
      relationalField_: {
        embedded: { embedded2: { embedded3: { name3_gt: 'ABC' }, name2_lt: 'XYZ' } },
      },
    };

    const result = composeWhereInput(where, entityConfig);
    const expectedResult = {
      where: {
        'relationalField_.embedded.embedded2.embedded3.name3': { $gt: 'ABC' },
        'relationalField_.embedded.embedded2.name2': { $lt: 'XYZ' },
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
