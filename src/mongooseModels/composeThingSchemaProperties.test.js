// @flow
/* eslint-env jest */
const mongoose = require('mongoose');
const composeThingSchemaProperties = require('./composeThingSchemaProperties');

const { Schema } = mongoose;

describe('composeThingSchemaProperties', () => {
  test('should compose schema properties with text fields', () => {
    const thingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField1',
        },
        {
          name: 'textField2',
          default: 'default text',
        },
        {
          name: 'textField3',
          required: true,
        },
        {
          name: 'textField4',
          array: true,
        },
        {
          name: 'textField5',
          default: ['default text'],
          required: true,
          array: true,
        },
      ],
    };
    const expectedResult = {
      textField1: {
        type: String,
        required: false,
        default: '',
      },
      textField2: {
        type: String,
        required: false,
        default: 'default text',
      },
      textField3: {
        type: String,
        required: true,
        default: '',
      },
      textField4: {
        type: [String],
        required: false,
        default: [],
      },
      textField5: {
        type: [String],
        required: true,
        default: ['default text'],
      },
    };

    const result = composeThingSchemaProperties(thingConfig);
    expect(result).toEqual(expectedResult);
  });
  test('should compose schema properties with text and relational fields', () => {
    const placeConfig = {
      name: 'Place',
      textFields: [{ name: 'name' }],
    };
    const personConfig = { name: 'Person', textFields: [], relationalFields: [] };
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
      relationalFields: [
        {
          name: 'friends',
          config: personConfig,
          array: true,
          required: true,
        },
        {
          name: 'enemies',
          config: personConfig,
          array: true,
        },
        {
          name: 'location',
          config: placeConfig,
          required: true,
        },
        {
          name: 'favoritePlace',
          config: placeConfig,
        },
      ],
    });
    const expectedResult = {
      firstName: {
        type: String,
        required: true,
        default: '',
      },
      lastName: {
        type: String,
        required: true,
        default: '',
      },
      friends: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Person',
          required: true,
        },
      ],
      enemies: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Person',
          required: false,
        },
      ],
      location: {
        type: Schema.Types.ObjectId,
        ref: 'Place',
        required: true,
      },
      favoritePlace: {
        type: Schema.Types.ObjectId,
        ref: 'Place',
        required: false,
      },
    };

    const result = composeThingSchemaProperties(personConfig);
    expect(result).toEqual(expectedResult);
  });
  test('should compose schema properties with text and duplex fields', () => {
    const personConfig = { name: 'Person', textFields: [], duplexFields: [] };
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
          oppositeName: 'favoritePlace',
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
          name: 'friends',
          oppositeName: 'friends',
          config: personConfig,
          array: true,
          required: true,
        },
        {
          name: 'enemies',
          oppositeName: 'enemies',
          array: true,
          config: personConfig,
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
        },
        {
          name: 'favoritePlace',
          oppositeName: 'visitors',
          config: placeConfig,
        },
      ],
    });
    const expectedResult = {
      firstName: {
        type: String,
        required: true,
        default: '',
      },
      lastName: {
        type: String,
        required: true,
        default: '',
      },
      friends: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Person',
          required: true,
        },
      ],
      enemies: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Person',
          required: false,
        },
      ],
      location: {
        type: Schema.Types.ObjectId,
        ref: 'Place',
        required: true,
      },
      favoritePlace: {
        type: Schema.Types.ObjectId,
        ref: 'Place',
        required: false,
      },
    };

    const result = composeThingSchemaProperties(personConfig);
    expect(result).toEqual(expectedResult);
  });
  test('should compose schema properties with text and embeded fields', () => {
    const addressConfig = {
      name: 'Address',
      isEmbedded: true,
      textFields: [
        {
          name: 'country',
          required: true,
          default: 'Ukraine',
        },
        {
          name: 'province',
        },
      ],
    };
    const personConfig = {
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
      embeddedFields: [
        {
          name: 'location',
          config: addressConfig,
          required: true,
        },
        {
          name: 'locations',
          array: true,
          config: addressConfig,
          required: true,
        },
        {
          name: 'place',
          config: addressConfig,
        },
        {
          name: 'places',
          array: true,
          config: addressConfig,
        },
      ],
    };

    const expectedResult = {
      firstName: {
        type: String,
        required: true,
        default: '',
      },
      lastName: {
        type: String,
        required: true,
        default: '',
      },
      location: {
        country: {
          type: String,
          required: true,
          default: 'Ukraine',
        },
        province: {
          type: String,
          required: false,
          default: '',
        },
      },
      locations: [
        {
          country: {
            type: String,
            required: true,
            default: 'Ukraine',
          },
          province: {
            type: String,
            required: false,
            default: '',
          },
        },
      ],
      place: {
        country: {
          type: String,
          required: true,
          default: 'Ukraine',
        },
        province: {
          type: String,
          required: false,
          default: '',
        },
      },
      places: [
        {
          country: {
            type: String,
            required: true,
            default: 'Ukraine',
          },
          province: {
            type: String,
            required: false,
            default: '',
          },
        },
      ],
    };

    const result = composeThingSchemaProperties(personConfig);
    expect(result).toEqual(expectedResult);
  });
});
