// @flow
/* eslint-env jest */
const createThingType = require('./createThingType');

describe('createThingType', () => {
  test('should create thing type with Text fields', () => {
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
    const expectedResult = `type Example {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  deletedAt: DateTime
  textField1: String
  textField2: String
  textField3: String!
  textField4: [String!]!
  textField5: [String!]!
}`;

    const result = createThingType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing type with relational fields', () => {
    const thingConfig = {
      thingName: 'Person',
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
    const expectedResult = `type Person {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  deletedAt: DateTime
  friends: [Person!]!
  enemies: [Person!]!
  location: Place!
  favoritePlace: Place
}`;

    const result = createThingType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
