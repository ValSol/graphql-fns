// @flow
/* eslint-env jest */
const mongoose = require('mongoose');
const composeThingSchemaProperties = require('./composeThingSchemaProperties');

const { Schema } = mongoose;

describe('composeThingSchemaProperties', () => {
  test('should compose schema properties with text fields', () => {
    const thingConfig = {
      thingName: 'Example',
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
    const thingConfig = {
      thingName: 'Person',
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
          thingName: 'Person',
          array: true,
          required: true,
        },
        {
          name: 'enemies',
          thingName: 'Person',
          array: true,
        },
        {
          name: 'location',
          thingName: 'Place',
          required: true,
        },
        {
          name: 'favoritePlace',
          thingName: 'Place',
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

    const result = composeThingSchemaProperties(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
