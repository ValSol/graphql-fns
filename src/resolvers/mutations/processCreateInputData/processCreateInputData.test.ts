/* eslint-env jest */

import { Types } from 'mongoose';

import type { Periphery, TangibleEntityConfig } from '../../../tsTypes';
import type { PreparedData } from '../../tsTypes';

import processCreateInputData from './index';

// TODO repaire this test!

// const mongooseTypes = {
//   count: 0,
//   ObjectId() {
//     this.count += 1;
//     return String(this.count);
//   },
// };

class ObjectId extends Types.ObjectId {
  constructor() {
    ObjectId.count += 1;
    const id = `00000000000000000000000${ObjectId.count}`.slice(-24);
    super(id);
  }

  static count = 0;
}

const mongooseTypes = { ObjectId };

// describe('describe', () => {
//   test('test', () => {
//     const id = new mongooseTypes.ObjectId();
//     const result = { id };

//     const expectedResult = { id: new Types.ObjectId('000000000000000000000001') };

//     expect(result).toEqual(expectedResult);
//   });
// });

describe('processCreateInputData', () => {
  test('should create object with scalar fields', () => {
    const preparedData: PreparedData = { mains: [], core: new Map(), periphery: new Map() };
    const entityConfig: TangibleEntityConfig = {
      name: 'Entity',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
          type: 'textFields',
        },
        {
          name: 'textField2',
          type: 'textFields',
        },
      ],
      intFields: [
        {
          name: 'intField1',
          type: 'intFields',
        },
        {
          name: 'intField2',
          type: 'intFields',
        },
      ],
      floatFields: [
        {
          name: 'floatField1',
          type: 'floatFields',
        },
        {
          name: 'floatField2',
          type: 'floatFields',
        },
      ],
      booleanFields: [
        {
          name: 'booleanField1',
          type: 'booleanFields',
        },
      ],
    };
    const data = {
      textField1: 'textField1-Value',
      textField2: 'textField2-Value',
      intField1: 0,
      intField2: 55,
      floatField1: 0.0,
      floatField2: 5.5,
      booleanField1: false,
    };

    const core = new Map();
    const item = {
      insertOne: {
        document: {
          _id: new Types.ObjectId('000000000000000000000001'),
          intField1: 0,
          intField2: 55,
          textField1: 'textField1-Value',
          textField2: 'textField2-Value',
          floatField1: 0.0,
          floatField2: 5.5,
          booleanField1: false,
        },
      },
    };

    core.set(entityConfig, [item]);
    const periphery: Periphery = new Map();
    const expectedResult = {
      core,
      periphery,

      mains: [
        {
          _id: new Types.ObjectId('000000000000000000000001'),
          intField1: 0,
          intField2: 55,
          floatField1: 0.0,
          floatField2: 5.5,
          textField1: 'textField1-Value',
          textField2: 'textField2-Value',
          booleanField1: false,
        },
      ],
    };
    const result = processCreateInputData(
      data,
      preparedData,
      entityConfig,
      'create',
      undefined,
      mongooseTypes,
    );

    expect(result).toEqual(expectedResult);
  });

  test('should create object with self relation fields', () => {
    const preparedData: PreparedData = { mains: [], core: new Map(), periphery: new Map() };
    const entityConfig = {} as TangibleEntityConfig;
    Object.assign(entityConfig, {
      name: 'Entity',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
          type: 'textFields',
        },
        {
          name: 'textField2',
          type: 'textFields',
        },
      ],
      relationalFields: [
        {
          name: 'relationalField1',
          oppositeName: 'parentRelationalField1',
          config: entityConfig,
          type: 'relationalFields',
        },
        {
          name: 'relationalField2',
          oppositeName: 'parentRelationalField2',
          config: entityConfig,
          array: true,
          type: 'relationalFields',
        },
      ],
    });
    const data = {
      textField1: 'textField1-Value',
      textField2: 'textField2-Value',
      relationalField1: { connect: '5caf757d62552d713461f420' },
      relationalField2: { connect: ['5caf757d62552d713461f420', '5cb0ab5a448c440720cf2594'] },
    };

    const core = new Map();
    const item = {
      insertOne: {
        document: {
          _id: new Types.ObjectId('000000000000000000000002'),
          textField1: 'textField1-Value',
          textField2: 'textField2-Value',
          relationalField1: '5caf757d62552d713461f420',
          relationalField2: ['5caf757d62552d713461f420', '5cb0ab5a448c440720cf2594'],
        },
      },
    };
    core.set(entityConfig, [item]);
    const periphery: Periphery = new Map();
    const expectedResult = {
      core,
      periphery,

      mains: [
        {
          _id: new Types.ObjectId('000000000000000000000002'),
          textField1: 'textField1-Value',
          textField2: 'textField2-Value',
          relationalField1: '5caf757d62552d713461f420',
          relationalField2: ['5caf757d62552d713461f420', '5cb0ab5a448c440720cf2594'],
        },
      ],
    };

    const result = processCreateInputData(
      data,
      preparedData,
      entityConfig,
      'create',
      undefined,
      mongooseTypes,
    );

    expect(result).toEqual(expectedResult);
  });

  test('should create object with embedded fields with relation fields', () => {
    const preparedData: PreparedData = {
      mains: [],
      core: new Map(),
      periphery: new Map(),
    };
    const embedded1Config = {} as TangibleEntityConfig;

    const embedded2Config = {} as TangibleEntityConfig;

    const entityConfig = {} as TangibleEntityConfig;

    Object.assign(embedded1Config, {
      name: 'Embedded1',
      type: 'embedded',
      textFields: [{ name: 'textField_e1', type: 'textFields' }],
      embeddedFields: [
        {
          name: 'embeddedField2',
          config: embedded2Config,
          type: 'embeddedFields',
          variants: ['plain'],
        },
      ],
    });

    Object.assign(embedded2Config, {
      name: 'Embedded2',
      type: 'embedded',
      textFields: [{ name: 'textField_e2', type: 'textFields' }],
      relationalFields: [
        { name: 'relationalField', config: entityConfig, type: 'relationalFields' },
      ],
    });

    Object.assign(entityConfig, {
      name: 'Entity',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
          type: 'textFields',
        },
        {
          name: 'textField2',
          type: 'textFields',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedField1',
          config: embedded1Config,
          type: 'embeddedFields',
          variants: ['plain'],
        },
      ],
    });
    const data = {
      textField1: 'textField1-Value',
      textField2: 'textField2-Value',
      embeddedField1: {
        textField_e1: 'textField_e1-value',
        embeddedField2: {
          textField_e2: 'textField_e2-value',
          relationalField: { connect: '5caf757d62552d713461f420' },
        },
      },
    };

    const core = new Map();
    const item = {
      insertOne: {
        document: {
          _id: new Types.ObjectId('000000000000000000000003'),
          textField1: 'textField1-Value',
          textField2: 'textField2-Value',
          embeddedField1: {
            textField_e1: 'textField_e1-value',
            embeddedField2: {
              textField_e2: 'textField_e2-value',
              relationalField: '5caf757d62552d713461f420',
            },
          },
        },
      },
    };
    core.set(entityConfig, [item]);
    const periphery: Periphery = new Map();
    const expectedResult = {
      core,
      periphery,

      mains: [
        {
          _id: new Types.ObjectId('000000000000000000000003'),
          textField1: 'textField1-Value',
          textField2: 'textField2-Value',
          embeddedField1: {
            textField_e1: 'textField_e1-value',
            embeddedField2: {
              textField_e2: 'textField_e2-value',
              relationalField: '5caf757d62552d713461f420',
            },
          },
        },
      ],
    };

    const result = processCreateInputData(
      data,
      preparedData,
      entityConfig,
      'create',
      undefined,
      mongooseTypes,
    );

    expect(result).toEqual(expectedResult);
  });

  test('should create object and children objectcs', () => {
    const preparedData: PreparedData = { mains: [], core: new Map(), periphery: new Map() };

    const personConfig = {} as TangibleEntityConfig;
    const placeConfig: TangibleEntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'city', type: 'textFields' }],
      relationalFields: [
        {
          name: 'citisens',
          oppositeName: 'location',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'customers',
          oppositeName: 'favorites',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
      ],
    };
    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          type: 'textFields',
        },
        {
          name: 'lastName',
          type: 'textFields',
        },
      ],
      relationalFields: [
        {
          name: 'location',
          oppositeName: 'citisens',
          config: placeConfig,
          type: 'relationalFields',
        },

        {
          name: 'favorites',
          oppositeName: 'customers',
          config: placeConfig,
          array: true,
          type: 'relationalFields',
        },
      ],
    });

    const data = {
      firstName: 'Vasya',
      lastName: 'Pupkin',
      location: { create: { city: 'Kyiv' } },
      favorites: {
        connect: ['777'],
        create: [{ city: 'Odesa' }, { city: 'Chernygiv' }, { city: 'Zhitomyr' }],
        createPositions: [0, 3, 2],
      },
    };

    const core = new Map();
    core.set(personConfig, [
      {
        insertOne: {
          document: {
            _id: new Types.ObjectId('000000000000000000000004'),
            firstName: 'Vasya',
            lastName: 'Pupkin',
            location: new Types.ObjectId('000000000000000000000005'),
            favorites: [
              new Types.ObjectId('000000000000000000000006'),
              '777',
              new Types.ObjectId('000000000000000000000008'),
              new Types.ObjectId('000000000000000000000007'),
            ],
          },
        },
      },
    ]);
    core.set(placeConfig, [
      {
        insertOne: {
          document: { _id: new Types.ObjectId('000000000000000000000005'), city: 'Kyiv' },
        },
      },
      {
        insertOne: {
          document: { _id: new Types.ObjectId('000000000000000000000006'), city: 'Odesa' },
        },
      },
      {
        insertOne: {
          document: { _id: new Types.ObjectId('000000000000000000000007'), city: 'Chernygiv' },
        },
      },
      {
        insertOne: {
          document: { _id: new Types.ObjectId('000000000000000000000008'), city: 'Zhitomyr' },
        },
      },
    ]);
    const periphery: Periphery = new Map();
    const expectedResult = {
      core,
      periphery,
      mains: [
        {
          _id: new Types.ObjectId('000000000000000000000004'),
          firstName: 'Vasya',
          lastName: 'Pupkin',
          location: new Types.ObjectId('000000000000000000000005'),
          favorites: [
            new Types.ObjectId('000000000000000000000006'),
            '777',
            new Types.ObjectId('000000000000000000000008'),
            new Types.ObjectId('000000000000000000000007'),
          ],
        },
      ],
    };

    const result = processCreateInputData(
      data,
      preparedData,
      personConfig,
      'create',
      undefined,
      mongooseTypes,
    );

    expect(result).toEqual(expectedResult);
  });

  test('should create object and children objectcs with duplex fields along with create', () => {
    const preparedData: PreparedData = { mains: [], core: new Map(), periphery: new Map() };

    const personConfig = {} as TangibleEntityConfig;
    const placeConfig: TangibleEntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name', type: 'textFields' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          config: personConfig,
          type: 'duplexFields',
        },
        {
          name: 'visitors',
          oppositeName: 'favorites',
          array: true,
          config: personConfig,
          type: 'duplexFields',
        },
      ],
    };
    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          required: true,
          type: 'textFields',
        },
        {
          name: 'lastName',
          required: true,
          type: 'textFields',
        },
      ],
      duplexFields: [
        {
          name: 'friend',
          oppositeName: 'friend',
          config: personConfig,
          required: true,
          type: 'duplexFields',
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
          type: 'duplexFields',
        },
        {
          name: 'favorites',
          oppositeName: 'visitors',
          config: placeConfig,
          array: true,
          type: 'duplexFields',
        },
      ],
    });
    const data = {
      firstName: 'Vasya',
      lastName: 'Pupkin',
      friend: {
        create: {
          firstName: 'Masha',
          lastName: 'Rasteryasha',
        },
      },
      location: { create: { name: 'Kyiv' } },
      favorites: {
        connect: ['777'],
        create: [{ name: 'Odesa' }, { name: 'Chernygiv' }, { name: 'Zhitomyr' }],
        createPositions: [0, 3, 2],
      },
    };

    const core = new Map();
    core.set(personConfig, [
      {
        insertOne: {
          document: {
            _id: new Types.ObjectId('000000000000000000000009'),
            firstName: 'Vasya',
            lastName: 'Pupkin',
            friend: new Types.ObjectId('000000000000000000000010'),
            location: new Types.ObjectId('000000000000000000000011'),
            favorites: [
              new Types.ObjectId('000000000000000000000012'),
              '777',
              new Types.ObjectId('000000000000000000000014'),
              new Types.ObjectId('000000000000000000000013'),
            ],
          },
        },
      },
      {
        insertOne: {
          document: {
            _id: new Types.ObjectId('000000000000000000000010'),
            firstName: 'Masha',
            lastName: 'Rasteryasha',
            friend: new Types.ObjectId('000000000000000000000009'),
          },
        },
      },
    ]);
    core.set(placeConfig, [
      {
        updateOne: {
          filter: {
            _id: '777',
          },
          update: {
            $push: {
              visitors: new Types.ObjectId('000000000000000000000009'),
            },
          },
        },
      },
      {
        insertOne: {
          document: {
            _id: new Types.ObjectId('000000000000000000000011'),
            name: 'Kyiv',
            citizens: [new Types.ObjectId('000000000000000000000009')],
          },
        },
      },
      {
        insertOne: {
          document: {
            _id: new Types.ObjectId('000000000000000000000012'),
            name: 'Odesa',
            visitors: [new Types.ObjectId('000000000000000000000009')],
          },
        },
      },
      {
        insertOne: {
          document: {
            _id: new Types.ObjectId('000000000000000000000013'),
            name: 'Chernygiv',
            visitors: [new Types.ObjectId('000000000000000000000009')],
          },
        },
      },
      {
        insertOne: {
          document: {
            _id: new Types.ObjectId('000000000000000000000014'),
            name: 'Zhitomyr',
            visitors: [new Types.ObjectId('000000000000000000000009')],
          },
        },
      },
    ]);
    const periphery: Periphery = new Map();
    const expectedResult = {
      core,
      periphery,
      mains: [
        {
          _id: new Types.ObjectId('000000000000000000000009'),
          firstName: 'Vasya',
          lastName: 'Pupkin',
          friend: new Types.ObjectId('000000000000000000000010'),
          location: new Types.ObjectId('000000000000000000000011'),
          favorites: [
            new Types.ObjectId('000000000000000000000012'),
            '777',
            new Types.ObjectId('000000000000000000000014'),
            new Types.ObjectId('000000000000000000000013'),
          ],
        },
      ],
    };

    const result = processCreateInputData(
      data,
      preparedData,
      personConfig,
      'create',
      undefined,
      mongooseTypes,
    );

    expect(result).toEqual(expectedResult);
  });

  test('should create object and children objectcs with duplex fields along with connect', () => {
    const preparedData: PreparedData = { mains: [], core: new Map(), periphery: new Map() };

    const personConfig = {} as TangibleEntityConfig;
    const placeConfig: TangibleEntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name', type: 'textFields' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          config: personConfig,
          type: 'duplexFields',
        },
        {
          name: 'visitors',
          oppositeName: 'favorites',
          array: true,
          config: personConfig,
          type: 'duplexFields',
        },
        {
          name: 'curator',
          oppositeName: 'locations',
          config: personConfig,
          type: 'duplexFields',
        },
      ],
    };
    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          required: true,
          type: 'textFields',
        },
        {
          name: 'lastName',
          required: true,
          type: 'textFields',
        },
      ],
      duplexFields: [
        {
          name: 'friend',
          oppositeName: 'friend',
          config: personConfig,
          required: true,
          type: 'duplexFields',
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
          type: 'duplexFields',
        },
        {
          name: 'locations',
          oppositeName: 'curator',
          config: placeConfig,
          array: true,
          type: 'duplexFields',
        },
        {
          name: 'favorites',
          oppositeName: 'visitors',
          config: placeConfig,
          array: true,
          type: 'duplexFields',
        },
      ],
    });
    const data = {
      firstName: 'Vasya',
      lastName: 'Pupkin',
      friend: {
        connect: '111',
      },
      location: {
        connect: '222',
      },
      locations: {
        connect: ['333', '444'],
      },
      favorites: {
        connect: ['555', '666'],
      },
    };

    const core = new Map();
    core.set(personConfig, [
      {
        updateOne: {
          filter: {
            _id: '111',
          },
          update: {
            friend: new Types.ObjectId('000000000000000000000015'),
          },
        },
      },
      {
        insertOne: {
          document: {
            _id: new Types.ObjectId('000000000000000000000015'),
            firstName: 'Vasya',
            lastName: 'Pupkin',
            friend: '111',
            location: '222',
            locations: ['333', '444'],
            favorites: ['555', '666'],
          },
        },
      },
    ]);
    core.set(placeConfig, [
      {
        updateOne: {
          filter: {
            _id: '222',
          },
          update: {
            $push: {
              citizens: new Types.ObjectId('000000000000000000000015'),
            },
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '333',
          },
          update: {
            curator: new Types.ObjectId('000000000000000000000015'),
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '444',
          },
          update: {
            curator: new Types.ObjectId('000000000000000000000015'),
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '555',
          },
          update: {
            $push: {
              visitors: new Types.ObjectId('000000000000000000000015'),
            },
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '666',
          },
          update: {
            $push: {
              visitors: new Types.ObjectId('000000000000000000000015'),
            },
          },
        },
      },
    ]);
    const periphery: Periphery = new Map();
    periphery.set(personConfig, {
      friend: {
        oppositeIds: ['111'],
        array: false,
        name: 'friend',
        oppositeConfig: personConfig,
      },
    });
    periphery.set(placeConfig, {
      curator: {
        oppositeIds: ['333', '444'],
        array: true,
        name: 'locations',
        oppositeConfig: personConfig,
      },
    });

    const expectedResult = {
      core,
      periphery,
      mains: [
        {
          _id: new Types.ObjectId('000000000000000000000015'),
          firstName: 'Vasya',
          lastName: 'Pupkin',
          friend: '111',
          location: '222',
          locations: ['333', '444'],
          favorites: ['555', '666'],
        },
      ],
    };

    const result = processCreateInputData(
      data,
      preparedData,
      personConfig,
      'create',
      undefined,
      mongooseTypes,
    );

    expect(result).toEqual(expectedResult);
  });

  test('should create object with array of embedded fields', () => {
    const preparedData: PreparedData = { mains: [], core: new Map(), periphery: new Map() };

    const embedded1Config = {} as TangibleEntityConfig;

    const embedded2Config = {} as TangibleEntityConfig;

    const entityConfig = {} as TangibleEntityConfig;

    Object.assign(embedded1Config, {
      name: 'Embedded1',
      type: 'embedded',
      textFields: [{ name: 'textField_e1', type: 'textFields' }],
      embeddedFields: [
        {
          array: true,
          name: 'embeddedField2S',
          config: embedded2Config,
          type: 'embeddedFields',
          variants: ['plain'],
        },
      ],
    });

    Object.assign(embedded2Config, {
      name: 'Embedded2',
      type: 'embedded',
      textFields: [{ name: 'textField_e2', type: 'textFields' }],
    });

    Object.assign(entityConfig, {
      name: 'Entity',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
          type: 'textFields',
        },
        {
          name: 'textField2',
          type: 'textFields',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedField1',
          config: embedded1Config,
          type: 'embeddedFields',
          variants: ['plain'],
        },
      ],
    });
    const data = {
      textField1: 'textField1-Value',
      textField2: 'textField2-Value',
      embeddedField1: {
        textField_e1: 'textField_e1-value',
        embeddedField2S: [
          {
            textField_e2: 'textField_e2-value-1',
          },
          {
            textField_e2: 'textField_e2-value-2',
          },
        ],
      },
    };

    const core = new Map();
    const item = {
      updateOne: {
        filter: {
          _id: new Types.ObjectId('000000000000000000000016'),
        },
        update: {
          $set: {
            textField1: 'textField1-Value',
            textField2: 'textField2-Value',
            embeddedField1: {
              textField_e1: 'textField_e1-value',
              embeddedField2S: [
                {
                  textField_e2: 'textField_e2-value-1',
                },
                {
                  textField_e2: 'textField_e2-value-2',
                },
              ],
            },
          },
        },
      },
    };
    core.set(entityConfig, [item]);
    const periphery: Periphery = new Map();
    const expectedResult = {
      core,
      periphery,

      mains: [
        {
          _id: new Types.ObjectId('000000000000000000000016'),
          textField1: 'textField1-Value',
          textField2: 'textField2-Value',
          embeddedField1: {
            textField_e1: 'textField_e1-value',
            embeddedField2S: [
              {
                textField_e2: 'textField_e2-value-1',
              },
              {
                textField_e2: 'textField_e2-value-2',
              },
            ],
          },
        },
      ],
    };

    const result = processCreateInputData(
      data,
      preparedData,
      entityConfig,
      'update',
      undefined,
      mongooseTypes,
    );

    expect(result).toEqual(expectedResult);
  });

  test('should return result with updateMany items', () => {
    const preparedData: PreparedData = { mains: [], core: new Map(), periphery: new Map() };
    const entityConfig: TangibleEntityConfig = {
      name: 'Entity',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
          type: 'textFields',
        },
        {
          name: 'textField2',
          type: 'textFields',
        },
      ],
      intFields: [
        {
          name: 'intField1',
          type: 'intFields',
        },
        {
          name: 'intField2',
          type: 'intFields',
        },
      ],
      floatFields: [
        {
          name: 'floatField1',
          type: 'floatFields',
        },
        {
          name: 'floatField2',
          type: 'floatFields',
        },
      ],
      booleanFields: [
        {
          name: 'booleanField1',
          type: 'booleanFields',
        },
      ],
    };
    const data = {
      id: '117',
      textField1: 'textField1-Value',
      textField2: 'textField2-Value',
      intField1: 0,
      intField2: 55,
      floatField1: 0.0,
      floatField2: 5.5,
      booleanField1: false,
    };

    const core = new Map();
    const item = {
      updateMany: {
        filter: { _id: { $in: ['117'] } },
        update: {
          $set: {
            intField1: 0,
            intField2: 55,
            textField1: 'textField1-Value',
            textField2: 'textField2-Value',
            floatField1: 0.0,
            floatField2: 5.5,
            booleanField1: false,
          },
        },
      },
    };

    core.set(entityConfig, [item]);
    const periphery: Periphery = new Map();
    const expectedResult = {
      core,
      periphery,

      mains: [
        {
          _id: '117',
          intField1: 0,
          intField2: 55,
          floatField1: 0.0,
          floatField2: 5.5,
          textField1: 'textField1-Value',
          textField2: 'textField2-Value',
          booleanField1: false,
        },
      ],
    };
    const preparedData2 = processCreateInputData(
      data,
      preparedData,
      entityConfig,
      'updateMany',
      undefined,
      mongooseTypes,
    );

    expect(preparedData2).toEqual(expectedResult);

    const data2 = {
      id: '118',
      textField1: 'textField1-Value',
      textField2: 'textField2-Value',
      intField1: 0,
      intField2: 55,
      floatField1: 0.0,
      floatField2: 5.5,
      booleanField1: false,
    };

    const item2 = {
      updateMany: {
        filter: { _id: { $in: ['117', '118'] } },
        update: {
          $set: {
            intField1: 0,
            intField2: 55,
            textField1: 'textField1-Value',
            textField2: 'textField2-Value',
            floatField1: 0.0,
            floatField2: 5.5,
            booleanField1: false,
          },
        },
      },
    };

    core.set(entityConfig, [item2]);
    const expectedResult2 = {
      core,
      periphery,

      mains: [
        {
          _id: '117',
          intField1: 0,
          intField2: 55,
          floatField1: 0.0,
          floatField2: 5.5,
          textField1: 'textField1-Value',
          textField2: 'textField2-Value',
          booleanField1: false,
        },
        {
          _id: '118',
          intField1: 0,
          intField2: 55,
          floatField1: 0.0,
          floatField2: 5.5,
          textField1: 'textField1-Value',
          textField2: 'textField2-Value',
          booleanField1: false,
        },
      ],
    };

    const result = processCreateInputData(
      data2,
      preparedData2,
      entityConfig,
      'updateMany',
      undefined,
      mongooseTypes,
    );

    expect(result).toEqual(expectedResult2);
  });

  test('should create object and children objectcs with duplex fields along with connect', () => {
    const preparedData: PreparedData = { mains: [], core: new Map(), periphery: new Map() };

    const menuConfig = {} as TangibleEntityConfig;
    const menuSectionConfig = {} as TangibleEntityConfig;
    const restaurantConfig: TangibleEntityConfig = {
      name: 'Restaurant',
      type: 'tangible',

      textFields: [{ name: 'title', type: 'textFields' }],

      duplexFields: [
        {
          name: 'menu',
          oppositeName: 'restaurant',
          config: menuConfig,
          type: 'duplexFields',
        },
      ],
    };

    Object.assign(menuConfig, {
      name: 'Menu',
      type: 'tangible',
      textFields: [
        {
          name: 'title',
          required: true,
          type: 'textFields',
        },
      ],
      duplexFields: [
        {
          name: 'restaurant',
          oppositeName: 'menu',
          config: restaurantConfig,
          required: true,
          type: 'duplexFields',
        },
        {
          name: 'sections',
          oppositeName: 'menu',
          config: menuSectionConfig,
          array: true,
          type: 'duplexFields',
        },
      ],
    });

    Object.assign(menuSectionConfig, {
      name: 'menuSectionConfig',
      textFields: [
        {
          name: 'title',
          required: true,
          type: 'textFields',
        },
      ],
      duplexFields: [
        {
          name: 'menu',
          oppositeName: 'sections',
          config: menuConfig,
          required: true,
          type: 'duplexFields',
        },
      ],
    });

    const data = {
      id: '500',
      title: 'Restaurant Title',
      menu: {
        create: {
          title: 'Menu Title',
          sections: {
            connect: ['510', '520'],
            create: [{ title: 'Menu Section 2' }],
            createPositions: [1],
          },
        },
      },
    };

    const core = new Map();
    core.set(restaurantConfig, [
      {
        updateOne: {
          filter: {
            _id: '500',
          },
          update: {
            $set: {
              menu: new Types.ObjectId('000000000000000000000017'),
              title: 'Restaurant Title',
            },
          },
        },
      },
    ]);

    core.set(menuConfig, [
      {
        insertOne: {
          document: {
            _id: new Types.ObjectId('000000000000000000000017'),
            title: 'Menu Title',
            restaurant: '500',
            sections: ['510', new Types.ObjectId('000000000000000000000018'), '520'],
          },
        },
      },
    ]);

    core.set(menuSectionConfig, [
      {
        updateOne: {
          filter: {
            _id: '510',
          },
          update: {
            menu: new Types.ObjectId('000000000000000000000017'),
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '520',
          },
          update: {
            menu: new Types.ObjectId('000000000000000000000017'),
          },
        },
      },
      {
        insertOne: {
          document: {
            _id: new Types.ObjectId('000000000000000000000018'),
            title: 'Menu Section 2',
            menu: new Types.ObjectId('000000000000000000000017'),
          },
        },
      },
    ]);

    const periphery: Periphery = new Map();

    periphery.set(menuSectionConfig, {
      menu: {
        oppositeIds: ['510', '520'],
        array: true,
        name: 'sections',
        oppositeConfig: menuConfig,
      },
    });

    const expectedResult = {
      core,
      periphery,
      mains: [
        {
          _id: '500',
          title: 'Restaurant Title',
          menu: new Types.ObjectId('000000000000000000000017'),
        },
      ],
    };

    const result = processCreateInputData(
      data,
      preparedData,
      restaurantConfig,
      'update',
      undefined,
      mongooseTypes,
    );

    expect(result).toEqual(expectedResult);
  });
});
