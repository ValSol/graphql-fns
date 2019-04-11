// @flow
/* eslint-env jest */
const createThingCreateInputType = require('./createThingCreateInputType');

describe('createThingCreateInputType', () => {
  test('should create thing input type with text fields', () => {
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
    const expectedResult = `input ExampleCreateInput {
  textField1: String
  textField2: String
  textField3: String!
  textField4: [String!]!
  textField5: [String!]!
}
input ExampleCreate2Input {
  connect: ID
  create: ExampleCreateInput
}`;

    const result = createThingCreateInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
  test('should create thing input type with relational fields', () => {
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
    const expectedResult = `input PersonCreateInput {
  friends: [PersonCreate2Input!]!
  enemies: [PersonCreate2Input!]!
  location: PlaceCreate2Input!
  favoritePlace: PlaceCreate2Input
}
input PersonCreate2Input {
  connect: ID
  create: PersonCreateInput
}`;

    const result = createThingCreateInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
