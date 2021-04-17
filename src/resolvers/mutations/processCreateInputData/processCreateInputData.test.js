// @flow
/* eslint-env jest */
import type { Periphery, ThingConfig } from '../../../flowTypes';

import processCreateInputData from './index';

const mongooseTypes = {
  count: 0,
  ObjectId() {
    this.count += 1;
    return String(this.count);
  },
};

describe('processCreateInputData', () => {
  test('should create object with scalar fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Thing',
      textFields: [
        {
          name: 'textField1',
        },
        {
          name: 'textField2',
        },
      ],
      intFields: [
        {
          name: 'intField1',
        },
        {
          name: 'intField2',
        },
      ],
      floatFields: [
        {
          name: 'floatField1',
        },
        {
          name: 'floatField2',
        },
      ],
      booleanFields: [
        {
          name: 'booleanField1',
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
          _id: '1',
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

    core.set(thingConfig, [item]);
    const single = true;
    const periphery: Periphery = new Map();
    const expectedResult = {
      core,
      periphery,
      single,
      first: {
        _id: '1',
        intField1: 0,
        intField2: 55,
        floatField1: 0.0,
        floatField2: 5.5,
        textField1: 'textField1-Value',
        textField2: 'textField2-Value',
        booleanField1: false,
      },
    };
    const result = processCreateInputData(data, null, null, thingConfig, false, mongooseTypes);

    expect(result).toEqual(expectedResult);
  });

  test('should create object with self relation fields', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Thing',
      textFields: [
        {
          name: 'textField1',
        },
        {
          name: 'textField2',
        },
      ],
      relationalFields: [
        {
          name: 'relationalField1',
          config: thingConfig,
        },
        {
          name: 'relationalField2',
          config: thingConfig,
          array: true,
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
          _id: '2',
          textField1: 'textField1-Value',
          textField2: 'textField2-Value',
          relationalField1: '5caf757d62552d713461f420',
          relationalField2: ['5caf757d62552d713461f420', '5cb0ab5a448c440720cf2594'],
        },
      },
    };
    core.set(thingConfig, [item]);
    const single = true;
    const periphery: Periphery = new Map();
    const expectedResult = {
      core,
      periphery,
      single,
      first: {
        _id: '2',
        textField1: 'textField1-Value',
        textField2: 'textField2-Value',
        relationalField1: '5caf757d62552d713461f420',
        relationalField2: ['5caf757d62552d713461f420', '5cb0ab5a448c440720cf2594'],
      },
    };

    const result = processCreateInputData(data, null, null, thingConfig, false, mongooseTypes);

    expect(result).toEqual(expectedResult);
  });

  test('should create object with embedded fields with relation fields', () => {
    const embedded1Config: ThingConfig = {};

    const embedded2Config: ThingConfig = {};

    const thingConfig = {};

    Object.assign(embedded1Config, {
      name: 'Embedded1',
      textFields: [{ name: 'textField_e1' }],
      embeddedFields: [{ name: 'embeddedField2', config: embedded2Config }],
    });

    Object.assign(embedded2Config, {
      name: 'Embedded2',
      textFields: [{ name: 'textField_e2' }],
      relationalFields: [{ name: 'relationalField', config: thingConfig }],
    });

    Object.assign(thingConfig, {
      name: 'Thing',
      textFields: [
        {
          name: 'textField1',
        },
        {
          name: 'textField2',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedField1',
          config: embedded1Config,
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
          _id: '3',
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
    core.set(thingConfig, [item]);
    const single = true;
    const periphery: Periphery = new Map();
    const expectedResult = {
      core,
      periphery,
      single,
      first: {
        _id: '3',
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
    };

    const result = processCreateInputData(data, null, null, thingConfig, false, mongooseTypes);

    expect(result).toEqual(expectedResult);
  });

  test('should create object and children objectcs', () => {
    const placeConfig: ThingConfig = {
      name: 'Place',
      textFields: [{ name: 'city' }],
    };
    const personConfig: ThingConfig = {
      name: 'Person',
      textFields: [
        {
          name: 'firstName',
        },
        {
          name: 'lastName',
        },
      ],
      relationalFields: [
        {
          name: 'location',
          config: placeConfig,
        },
        {
          name: 'favorites',
          config: placeConfig,
          array: true,
        },
      ],
    };
    const data = {
      firstName: 'Vasya',
      lastName: 'Pupkin',
      location: { create: { city: 'Kyiv' } },
      favorites: {
        connect: ['777'],
        create: [{ city: 'Odesa' }, { city: 'Chernygiv' }, { city: 'Zhitomyr' }],
      },
    };

    const core = new Map();
    core.set(personConfig, [
      {
        insertOne: {
          document: {
            _id: '4',
            firstName: 'Vasya',
            lastName: 'Pupkin',
            location: '5',
            favorites: ['777', '6', '7', '8'],
          },
        },
      },
    ]);
    core.set(placeConfig, [
      { insertOne: { document: { _id: '5', city: 'Kyiv' } } },
      { insertOne: { document: { _id: '6', city: 'Odesa' } } },
      { insertOne: { document: { _id: '7', city: 'Chernygiv' } } },
      { insertOne: { document: { _id: '8', city: 'Zhitomyr' } } },
    ]);
    const periphery: Periphery = new Map();
    const expectedResult = {
      core,
      periphery,
      single: false,
      first: {
        _id: '4',
        firstName: 'Vasya',
        lastName: 'Pupkin',
        location: '5',
        favorites: ['777', '6', '7', '8'],
      },
    };

    const result = processCreateInputData(data, null, null, personConfig, false, mongooseTypes);

    expect(result).toEqual(expectedResult);
  });

  test('should create object and children objectcs with duplex fields along with create', () => {
    const personConfig: ThingConfig = {};
    const placeConfig = {
      name: 'Place',
      textFields: [{ name: 'name' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          config: personConfig,
        },
        {
          name: 'visitors',
          oppositeName: 'favorites',
          array: true,
          config: personConfig,
        },
      ],
    };
    Object.assign(personConfig, {
      name: 'Person',
      textFields: [
        {
          name: 'firstName',
          required: true,
        },
        {
          name: 'lastName',
          required: true,
        },
      ],
      duplexFields: [
        {
          name: 'friend',
          oppositeName: 'friend',
          config: personConfig,
          required: true,
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
        },
        {
          name: 'favorites',
          oppositeName: 'visitors',
          config: placeConfig,
          array: true,
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
      },
    };

    const core = new Map();
    core.set(personConfig, [
      {
        insertOne: {
          document: {
            _id: '9',
            firstName: 'Vasya',
            lastName: 'Pupkin',
            friend: '10',
            location: '11',
            favorites: ['777', '12', '13', '14'],
          },
        },
      },
      {
        insertOne: {
          document: {
            _id: '10',
            firstName: 'Masha',
            lastName: 'Rasteryasha',
            friend: '9',
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
              visitors: '9',
            },
          },
        },
      },
      {
        insertOne: { document: { _id: '11', name: 'Kyiv', citizens: ['9'] } },
      },
      {
        insertOne: { document: { _id: '12', name: 'Odesa', visitors: ['9'] } },
      },
      {
        insertOne: { document: { _id: '13', name: 'Chernygiv', visitors: ['9'] } },
      },
      {
        insertOne: { document: { _id: '14', name: 'Zhitomyr', visitors: ['9'] } },
      },
    ]);
    const periphery: Periphery = new Map();
    const expectedResult = {
      core,
      periphery,
      single: false,
      first: {
        _id: '9',
        firstName: 'Vasya',
        lastName: 'Pupkin',
        friend: '10',
        location: '11',
        favorites: ['777', '12', '13', '14'],
      },
    };

    const result = processCreateInputData(data, null, null, personConfig, false, mongooseTypes);

    expect(result).toEqual(expectedResult);
  });

  test('should create object and children objectcs with duplex fields along with connect', () => {
    const personConfig: ThingConfig = {};
    const placeConfig = {
      name: 'Place',
      textFields: [{ name: 'name' }],
      duplexFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          array: true,
          config: personConfig,
        },
        {
          name: 'visitors',
          oppositeName: 'favorites',
          array: true,
          config: personConfig,
        },
        {
          name: 'curator',
          oppositeName: 'locations',
          config: personConfig,
        },
      ],
    };
    Object.assign(personConfig, {
      name: 'Person',
      textFields: [
        {
          name: 'firstName',
          required: true,
        },
        {
          name: 'lastName',
          required: true,
        },
      ],
      duplexFields: [
        {
          name: 'friend',
          oppositeName: 'friend',
          config: personConfig,
          required: true,
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
        },
        {
          name: 'locations',
          oppositeName: 'curator',
          config: placeConfig,
          array: true,
        },
        {
          name: 'favorites',
          oppositeName: 'visitors',
          config: placeConfig,
          array: true,
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
            friend: '15',
          },
        },
      },
      {
        insertOne: {
          document: {
            _id: '15',
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
              citizens: '15',
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
            curator: '15',
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: '444',
          },
          update: {
            curator: '15',
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
              visitors: '15',
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
              visitors: '15',
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
      single: false,
      first: {
        _id: '15',
        firstName: 'Vasya',
        lastName: 'Pupkin',
        friend: '111',
        location: '222',
        locations: ['333', '444'],
        favorites: ['555', '666'],
      },
    };

    const result = processCreateInputData(data, null, null, personConfig, false, mongooseTypes);

    expect(result).toEqual(expectedResult);
  });

  test('should create object with array of embedded fields', () => {
    const embedded1Config: ThingConfig = {};

    const embedded2Config: ThingConfig = {};

    const thingConfig = {};

    Object.assign(embedded1Config, {
      name: 'Embedded1',
      textFields: [{ name: 'textField_e1' }],
      embeddedFields: [
        {
          array: true,
          name: 'embeddedField2S',
          config: embedded2Config,
        },
      ],
    });

    Object.assign(embedded2Config, {
      name: 'Embedded2',
      textFields: [{ name: 'textField_e2' }],
    });

    Object.assign(thingConfig, {
      name: 'Thing',
      textFields: [
        {
          name: 'textField1',
        },
        {
          name: 'textField2',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedField1',
          config: embedded1Config,
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
      insertOne: {
        document: {
          _id: '16',
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
    };
    core.set(thingConfig, [item]);
    const single = true;
    const periphery: Periphery = new Map();
    const expectedResult = {
      core,
      periphery,
      single,
      first: {
        _id: '16',
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
    };

    const result = processCreateInputData(data, null, null, thingConfig, false, mongooseTypes);

    expect(result).toEqual(expectedResult);
  });
});
