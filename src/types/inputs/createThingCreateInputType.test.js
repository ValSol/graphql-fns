// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

const createThingCreateInputType = require('./createThingCreateInputType');

describe('createThingCreateInputType', () => {
  test('should create thing input type with text fields', () => {
    const thingConfig: ThingConfig = {
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
    const expectedResult = `input ExampleCreateInput {
  textField1: String
  textField2: String
  textField3: String!
  textField4: [String!]!
  textField5: [String!]!
}
input ExampleCreateChildInput {
  connect: ID
  create: ExampleCreateInput
}
input ExampleCreateChildrenInput {
  connect: [ID!]
  create: [ExampleCreateInput!]
}`;

    const result = createThingCreateInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type with relational fields', () => {
    const placeConfig: ThingConfig = {
      name: 'Place',
      textFields: [{ name: 'name' }],
    };
    const personConfig: ThingConfig = {};
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
    const expectedResult = `input PersonCreateInput {
  friends: PersonCreateChildrenInput!
  enemies: PersonCreateChildrenInput
  location: PlaceCreateChildInput!
  favoritePlace: PlaceCreateChildInput
}
input PersonCreateChildInput {
  connect: ID
  create: PersonCreateInput
}
input PersonCreateChildrenInput {
  connect: [ID!]
  create: [PersonCreateInput!]
}`;

    const result = createThingCreateInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create embedded thing input type with text fields', () => {
    const addressConfig: ThingConfig = {
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
    const expectedResult = `input AddressCreateInput {
  country: String!
  province: String
}`;

    const result = createThingCreateInputType(addressConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type with embedded fields', () => {
    const addressConfig: ThingConfig = {
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
    const personConfig: ThingConfig = {
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
    const expectedResult = `input PersonCreateInput {
  firstName: String!
  lastName: String!
  location: AddressCreateInput!
  locations: [AddressCreateInput!]!
  place: AddressCreateInput
  places: [AddressCreateInput!]!
}
input PersonCreateChildInput {
  connect: ID
  create: PersonCreateInput
}
input PersonCreateChildrenInput {
  connect: [ID!]
  create: [PersonCreateInput!]
}`;

    const result = createThingCreateInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });
  test('should create thing input type with duplex fields', () => {
    const personConfig: ThingConfig = {};
    const placeConfig: ThingConfig = {
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
    const expectedResult = `input PersonCreateInput {
  firstName: String!
  lastName: String!
  friends: PersonCreateChildrenInput!
  enemies: PersonCreateChildrenInput
  location: PlaceCreateChildInput!
  favoritePlace: PlaceCreateChildInput
}
input PersonCreateChildInput {
  connect: ID
  create: PersonCreateInput
}
input PersonCreateChildrenInput {
  connect: [ID!]
  create: [PersonCreateInput!]
}`;

    const result = createThingCreateInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type with geospatial fields', () => {
    const thingConfig = {
      name: 'Example',
      geospatialFields: [
        {
          name: 'position',
          type: 'Point',
          required: true,
        },
        {
          name: 'precedingPosition',
          type: 'Point',
        },
        {
          name: 'favoritePositions',
          array: true,
          type: 'Point',
          required: true,
        },
        {
          name: 'worstPositions',
          array: true,
          type: 'Point',
        },
        {
          name: 'area',
          type: 'Polygon',
          required: true,
        },
        {
          name: 'precedingArea',
          type: 'Polygon',
        },
        {
          name: 'favoriteAreas',
          array: true,
          type: 'Polygon',
          required: true,
        },
        {
          name: 'worstAreas',
          array: true,
          type: 'Polygon',
        },
      ],
    };
    const expectedResult = `input ExampleCreateInput {
  position: GeospatialPointInput!
  precedingPosition: GeospatialPointInput
  favoritePositions: [GeospatialPointInput!]!
  worstPositions: [GeospatialPointInput!]!
  area: GeospatialPolygonInput!
  precedingArea: GeospatialPolygonInput
  favoriteAreas: [GeospatialPolygonInput!]!
  worstAreas: [GeospatialPolygonInput!]!
}
input ExampleCreateChildInput {
  connect: ID
  create: ExampleCreateInput
}
input ExampleCreateChildrenInput {
  connect: [ID!]
  create: [ExampleCreateInput!]
}`;

    const result = createThingCreateInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
