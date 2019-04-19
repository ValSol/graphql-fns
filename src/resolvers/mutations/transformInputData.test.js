// @flow
/* eslint-env jest */
const transformInputData = require('./transformInputData');

const mongooseTypes = {
  count: 0,
  ObjectId() {
    this.count += 1;
    return String(this.count);
  },
};

describe('transformInputData', () => {
  test('should create object with simple fields', () => {
    const thingConfig = {
      name: 'Thing',
      textFields: [
        {
          name: 'textField1',
        },
        {
          name: 'textField2',
        },
      ],
    };
    const data = {
      textField1: 'textField1-Value',
      textField2: 'textField2-Value',
    };

    const expectedResult = [
      {
        config: thingConfig,
        data: {
          _id: '1',
          textField1: 'textField1-Value',
          textField2: 'textField2-Value',
        },
      },
    ];
    const result = transformInputData(data, thingConfig, mongooseTypes);

    expect(result).toEqual(expectedResult);
  });
  test('should create object with self relation fields', () => {
    const thingConfig = {
      name: 'Thing',
      textFields: [],
      relationalFields: [],
    };
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

    const expectedResult = [
      {
        config: thingConfig,
        data: {
          _id: '2',
          textField1: 'textField1-Value',
          textField2: 'textField2-Value',
          relationalField1: '5caf757d62552d713461f420',
          relationalField2: ['5caf757d62552d713461f420', '5cb0ab5a448c440720cf2594'],
        },
      },
    ];

    const result = transformInputData(data, thingConfig, mongooseTypes);

    expect(result).toEqual(expectedResult);
  });
  test('should create object with embedded fields with relation fields', () => {
    const embedded1Config = {
      name: 'Embedded1',
      textFields: [],
      embeddedFields: [],
    };

    const embedded2Config = {
      name: 'Embedded2',
      textFields: [],
      relationalFields: [],
    };

    const thingConfig = {
      name: 'Thing',
      textFields: [],
      embeddedFields: [],
    };

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

    const expectedResult = [
      {
        config: thingConfig,
        data: {
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
    ];

    const result = transformInputData(data, thingConfig, mongooseTypes);

    expect(result).toEqual(expectedResult);
  });

  test('should create object and children objectcs', () => {
    const placeConfig = {
      name: 'Place',
      textFields: [{ name: 'city' }],
    };
    const personConfig = {
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

    const expectedResult = [
      {
        config: personConfig,
        data: {
          _id: '4',
          firstName: 'Vasya',
          lastName: 'Pupkin',
          location: '5',
          favorites: ['777', '6', '7', '8'],
        },
      },
      { config: placeConfig, data: { _id: '5', city: 'Kyiv' } },
      { config: placeConfig, data: { _id: '6', city: 'Odesa' } },
      { config: placeConfig, data: { _id: '7', city: 'Chernygiv' } },
      { config: placeConfig, data: { _id: '8', city: 'Zhitomyr' } },
    ];

    const result = transformInputData(data, personConfig, mongooseTypes);

    expect(result).toEqual(expectedResult);
  });
  test('should create object and children objectcs along with ', () => {
    const personConfig = {
      name: 'Person',
      textFields: [],
      duplexFields: [],
    };
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
        // {
        //   name: 'friends',
        //   oppositeName: 'friends',
        //   config: personConfig,
        //   array: true,
        //   required: true,
        // },
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
      location: { create: { city: 'Kyiv' } },
      favorites: {
        create: [{ city: 'Odesa' }, { city: 'Chernygiv' }, { city: 'Zhitomyr' }],
      },
    };

    const expectedResult = [
      {
        config: personConfig,
        data: {
          _id: '9',
          firstName: 'Vasya',
          lastName: 'Pupkin',
          location: '10',
          favorites: ['11', '12', '13'],
        },
      },
      { config: placeConfig, data: { _id: '10', city: 'Kyiv', citizens: ['9'] } },
      { config: placeConfig, data: { _id: '11', city: 'Odesa', visitors: ['9'] } },
      { config: placeConfig, data: { _id: '12', city: 'Chernygiv', visitors: ['9'] } },
      { config: placeConfig, data: { _id: '13', city: 'Zhitomyr', visitors: ['9'] } },
    ];

    const result = transformInputData(data, personConfig, mongooseTypes);

    expect(result).toEqual(expectedResult);
  });
});
