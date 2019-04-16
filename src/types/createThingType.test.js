// @flow
/* eslint-env jest */
const createThingType = require('./createThingType');

describe('createThingType', () => {
  test('should create thing type with Text fields', () => {
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
    const placeConfig = {
      name: 'Place',
      textFields: [{ name: 'name' }],
    };
    const personConfig = {
      name: 'Person',
      relationalFields: [],
    };
    Object.assign(personConfig, {
      name: 'Person',
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

    const result = createThingType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing type with embedded fields', () => {
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
    const expectedResult = `type Person {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  deletedAt: DateTime
  firstName: String!
  lastName: String!
  location: Address!
  locations: [Address!]!
  place: Address
  places: [Address!]!
}`;

    const result = createThingType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create embeded thing type with text fields', () => {
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
    const expectedResult = `type Address {
  id: ID!
  country: String!
  province: String
}`;

    const result = createThingType(addressConfig);
    expect(result).toEqual(expectedResult);
  });
});
