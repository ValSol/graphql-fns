/* eslint-env jest */

import type { EmbeddedEntityConfig, TangibleEntityConfig } from '../../tsTypes';

import createEntityCreateInputType from './createEntityCreateInputType';
import createEntityWhereInputType from './createEntityWhereInputType';
import createEntityWhereOneInputType from './createEntityWhereOneInputType';

describe('createEntityCreateInputType', () => {
  test('should create entity input type with text fields', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
          type: 'textFields',
        },
        {
          name: 'textField2',
          default: 'default text',
          type: 'textFields',
        },
        {
          name: 'textField3',
          required: true,
          type: 'textFields',
        },
        {
          name: 'textField4',
          array: true,
          type: 'textFields',
        },
        {
          name: 'textField5',
          default: ['default text'],
          required: true,
          array: true,
          type: 'textFields',
        },
      ],
    };
    const expectedResult = [
      'ExampleCreateInput',
      `input ExampleCreateInput {
  id: ID
  textField1: String
  textField2: String
  textField3: String!
  textField4: [String!]
  textField5: [String!]!
}
input ExampleCreateChildInput {
  connect: ID
  create: ExampleCreateInput
}
input ExampleCreateOrPushChildrenInput {
  connect: [ID!]
  create: [ExampleCreateInput!]
  createPositions: [Int!]
}`,
      {},
    ];

    const result = createEntityCreateInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type with relational fields', () => {
    const personConfig = {} as TangibleEntityConfig;

    const placeConfig: TangibleEntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name', type: 'textFields' }],
      relationalFields: [
        {
          name: 'location',
          oppositeName: 'citizens',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'favoritePlace',
          oppositeName: 'customers',
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
      relationalFields: [
        {
          name: 'friends',
          oppositeName: 'fellows',
          config: personConfig,
          array: true,
          required: true,
          type: 'relationalFields',
        },
        {
          name: 'fellows',
          oppositeName: 'friends',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'enemies',
          oppositeName: 'opponents',
          config: personConfig,
          array: true,
          type: 'relationalFields',
        },
        {
          name: 'opponents',
          oppositeName: 'enemies',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
          type: 'relationalFields',
        },
        {
          name: 'favoritePlace',
          oppositeName: 'customers',
          config: placeConfig,
          type: 'relationalFields',
        },
      ],
    });
    const expectedResult = [
      'PersonCreateInput',
      `input PersonCreateInput {
  id: ID
  friends: PersonCreateOrPushChildrenInput!
  enemies: PersonCreateOrPushChildrenInput
  location: PlaceCreateChildInput!
  favoritePlace: PlaceCreateChildInput
}
input PersonCreateChildInput {
  connect: ID
  create: PersonCreateInput
}
input PersonCreateOrPushChildrenInput {
  connect: [ID!]
  create: [PersonCreateInput!]
  createPositions: [Int!]
}`,
      {
        PersonCreateInput: [createEntityCreateInputType, personConfig],
        PlaceCreateInput: [createEntityCreateInputType, placeConfig],
      },
    ];

    const result = createEntityCreateInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create embedded entity input type with text fields', () => {
    const addressConfig: EmbeddedEntityConfig = {
      name: 'Address',
      type: 'embedded',
      textFields: [
        {
          name: 'country',
          required: true,
          default: 'Ukraine',
          type: 'textFields',
        },
        {
          name: 'province',
          type: 'textFields',
        },
      ],
    };
    const expectedResult = [
      'AddressCreateInput',
      `input AddressCreateInput {
  country: String!
  province: String
}`,
      {},
    ];

    const result = createEntityCreateInputType(addressConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type with embedded fields', () => {
    const addressConfig: EmbeddedEntityConfig = {
      name: 'Address',
      type: 'embedded',
      textFields: [
        {
          name: 'country',
          required: true,
          default: 'Ukraine',
          type: 'textFields',
        },
        {
          name: 'province',
          type: 'textFields',
        },
      ],
    };
    const personConfig: TangibleEntityConfig = {
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
      embeddedFields: [
        {
          name: 'location',
          config: addressConfig,
          required: true,
          type: 'embeddedFields',
        },
        {
          name: 'locations',
          array: true,
          config: addressConfig,
          required: true,
          type: 'embeddedFields',
          variants: ['plain'],
        },
        {
          name: 'place',
          config: addressConfig,
          type: 'embeddedFields',
        },
        {
          name: 'places',
          array: true,
          config: addressConfig,
          type: 'embeddedFields',
          variants: ['plain'],
        },
      ],
    };
    const expectedResult = [
      'PersonCreateInput',
      `input PersonCreateInput {
  id: ID
  firstName: String!
  lastName: String!
  location: AddressCreateInput!
  locations: [AddressCreateInput!]!
  place: AddressCreateInput
  places: [AddressCreateInput!]
}
input PersonCreateChildInput {
  connect: ID
  create: PersonCreateInput
}
input PersonCreateOrPushChildrenInput {
  connect: [ID!]
  create: [PersonCreateInput!]
  createPositions: [Int!]
}`,
      { AddressCreateInput: [createEntityCreateInputType, addressConfig] },
    ];

    const result = createEntityCreateInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  describe('test menu & menuSections duplex fields (retrospective test)', () => {
    const menuSectionConfig = {} as TangibleEntityConfig;
    const menuConfig: TangibleEntityConfig = {
      name: 'Menu',
      type: 'tangible',
      duplexFields: [
        {
          name: 'sections',
          oppositeName: 'menu',
          config: menuSectionConfig,
          array: true,
          type: 'duplexFields',
        },
      ],
    };
    Object.assign(menuSectionConfig, {
      name: 'MenuSection',
      type: 'tangible',
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

    test('should create entity input type for Menu duplex fields', () => {
      const expectedResult = [
        'MenuCreateInput',
        `input MenuCreateInput {
  id: ID
  sections: MenuSectionCreateOrPushThru_menu_FieldChildrenInput
}
input MenuCreateChildInput {
  connect: ID
  create: MenuCreateInput
}
input MenuCreateOrPushChildrenInput {
  connect: [ID!]
  create: [MenuCreateInput!]
  createPositions: [Int!]
}`,
        { MenuSectionCreateInput: [createEntityCreateInputType, menuSectionConfig] },
      ];

      const result = createEntityCreateInputType(menuConfig);
      expect(result).toEqual(expectedResult);
    });

    test('should create entity input type for Menu duplex fields', () => {
      const expectedResult = [
        'MenuSectionCreateInput',
        `input MenuSectionCreateInput {
  id: ID
  menu: MenuCreateChildInput!
}
input MenuSectionCreateThru_menu_FieldInput {
  menu: MenuCreateChildInput
}
input MenuSectionCreateChildInput {
  connect: ID
  create: MenuSectionCreateInput
}
input MenuSectionCreateOrPushChildrenInput {
  connect: [ID!]
  create: [MenuSectionCreateInput!]
  createPositions: [Int!]
}
input MenuSectionCreateThru_menu_FieldChildInput {
  connect: ID
  create: MenuSectionCreateThru_menu_FieldInput
}
input MenuSectionCreateOrPushThru_menu_FieldChildrenInput {
  connect: [ID!]
  create: [MenuSectionCreateThru_menu_FieldInput!]
  createPositions: [Int!]
}`,
        { MenuCreateInput: [createEntityCreateInputType, menuConfig] },
      ];

      const result = createEntityCreateInputType(menuSectionConfig);
      expect(result).toEqual(expectedResult);
    });
  });

  test('should create entity input type with filter fields', () => {
    const personConfig = {} as TangibleEntityConfig;
    const placeConfig: TangibleEntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name', type: 'textFields' }],
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
      filterFields: [
        {
          name: 'places',
          config: placeConfig,
          array: true,
        },
        {
          name: 'place',
          config: placeConfig,
        },
        {
          name: 'requiredPlaces',
          config: placeConfig,
          array: true,
          required: true,
        },
        {
          name: 'requiredPlace',
          config: placeConfig,
          required: true,
        },
      ],
    });
    const expectedResult = [
      'PersonCreateInput',
      `input PersonCreateInput {
  id: ID
  places: PlaceWhereInput
  place: PlaceWhereOneInput
  requiredPlaces: PlaceWhereInput!
  requiredPlace: PlaceWhereOneInput!
  firstName: String!
  lastName: String!
}
input PersonCreateChildInput {
  connect: ID
  create: PersonCreateInput
}
input PersonCreateOrPushChildrenInput {
  connect: [ID!]
  create: [PersonCreateInput!]
  createPositions: [Int!]
}`,
      {
        PlaceWhereInput: [createEntityWhereInputType, placeConfig],
        PlaceWhereOneInput: [createEntityWhereOneInputType, placeConfig],
      },
    ];

    const result = createEntityCreateInputType(personConfig);

    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type with duplex fields', () => {
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
          oppositeName: 'favoritePlace',
          array: true,
          config: personConfig,
          required: true,
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
          name: 'friends',
          oppositeName: 'friends',
          config: personConfig,
          array: true,
          required: true,
          type: 'duplexFields',
        },
        {
          name: 'enemies',
          oppositeName: 'enemies',
          array: true,
          config: personConfig,
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
          name: 'favoritePlace',
          oppositeName: 'visitors',
          config: placeConfig,
          type: 'duplexFields',
        },
      ],
    });
    const expectedResult = [
      'PersonCreateInput',
      `input PersonCreateInput {
  id: ID
  friends: PersonCreateOrPushThru_friends_FieldChildrenInput!
  enemies: PersonCreateOrPushChildrenInput
  location: PlaceCreateChildInput!
  favoritePlace: PlaceCreateThru_visitors_FieldChildInput
  firstName: String!
  lastName: String!
}
input PersonCreateThru_friends_FieldInput {
  friends: PersonCreateOrPushThru_friends_FieldChildrenInput
  enemies: PersonCreateOrPushChildrenInput
  location: PlaceCreateChildInput!
  favoritePlace: PlaceCreateThru_visitors_FieldChildInput
  firstName: String!
  lastName: String!
}
input PersonCreateThru_location_FieldInput {
  friends: PersonCreateOrPushThru_friends_FieldChildrenInput!
  enemies: PersonCreateOrPushChildrenInput
  location: PlaceCreateChildInput
  favoritePlace: PlaceCreateThru_visitors_FieldChildInput
  firstName: String!
  lastName: String!
}
input PersonCreateChildInput {
  connect: ID
  create: PersonCreateInput
}
input PersonCreateOrPushChildrenInput {
  connect: [ID!]
  create: [PersonCreateInput!]
  createPositions: [Int!]
}
input PersonCreateThru_friends_FieldChildInput {
  connect: ID
  create: PersonCreateThru_friends_FieldInput
}
input PersonCreateOrPushThru_friends_FieldChildrenInput {
  connect: [ID!]
  create: [PersonCreateThru_friends_FieldInput!]
  createPositions: [Int!]
}
input PersonCreateThru_location_FieldChildInput {
  connect: ID
  create: PersonCreateThru_location_FieldInput
}
input PersonCreateOrPushThru_location_FieldChildrenInput {
  connect: [ID!]
  create: [PersonCreateThru_location_FieldInput!]
  createPositions: [Int!]
}`,
      {
        PersonCreateInput: [createEntityCreateInputType, personConfig],
        PlaceCreateInput: [createEntityCreateInputType, placeConfig],
      },
    ];

    const result = createEntityCreateInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type with geospatial fields', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      geospatialFields: [
        {
          name: 'position',
          geospatialType: 'Point',
          required: true,
          type: 'geospatialFields',
        },
        {
          name: 'precedingPosition',
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
        {
          name: 'favoritePositions',
          array: true,
          geospatialType: 'Point',
          required: true,
          type: 'geospatialFields',
        },
        {
          name: 'worstPositions',
          array: true,
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
        {
          name: 'area',
          geospatialType: 'Polygon',
          required: true,
          type: 'geospatialFields',
        },
        {
          name: 'precedingArea',
          geospatialType: 'Polygon',
          type: 'geospatialFields',
        },
        {
          name: 'favoriteAreas',
          array: true,
          geospatialType: 'Polygon',
          required: true,
          type: 'geospatialFields',
        },
        {
          name: 'worstAreas',
          array: true,
          geospatialType: 'Polygon',
          type: 'geospatialFields',
        },
      ],
    };
    const expectedResult = [
      'ExampleCreateInput',
      `input ExampleCreateInput {
  id: ID
  position: GeospatialPointInput!
  precedingPosition: GeospatialPointInput
  favoritePositions: [GeospatialPointInput!]!
  worstPositions: [GeospatialPointInput!]
  area: GeospatialPolygonInput!
  precedingArea: GeospatialPolygonInput
  favoriteAreas: [GeospatialPolygonInput!]!
  worstAreas: [GeospatialPolygonInput!]
}
input ExampleCreateChildInput {
  connect: ID
  create: ExampleCreateInput
}
input ExampleCreateOrPushChildrenInput {
  connect: [ID!]
  create: [ExampleCreateInput!]
  createPositions: [Int!]
}`,
      {},
    ];

    const result = createEntityCreateInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type with enum fields', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      enumFields: [
        {
          name: 'field1',
          enumName: 'Weekdays',
          type: 'enumFields',
        },
        {
          name: 'field2',
          array: true,
          enumName: 'Cuisines',
          type: 'enumFields',
        },
        {
          name: 'field3',
          enumName: 'Weekdays',
          required: true,
          type: 'enumFields',
        },
        {
          name: 'field4',
          array: true,
          enumName: 'Cuisines',
          required: true,
          type: 'enumFields',
        },
      ],
    };
    const expectedResult = [
      'ExampleCreateInput',
      `input ExampleCreateInput {
  id: ID
  field1: WeekdaysEnumeration
  field2: [CuisinesEnumeration!]
  field3: WeekdaysEnumeration!
  field4: [CuisinesEnumeration!]!
}
input ExampleCreateChildInput {
  connect: ID
  create: ExampleCreateInput
}
input ExampleCreateOrPushChildrenInput {
  connect: [ID!]
  create: [ExampleCreateInput!]
  createPositions: [Int!]
}`,
      {},
    ];

    const result = createEntityCreateInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity type with int fields', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      intFields: [
        {
          name: 'intField1',
          type: 'intFields',
        },
        {
          name: 'intField2',
          default: 0,
          type: 'intFields',
        },
        {
          name: 'intField3',
          required: true,
          type: 'intFields',
        },
        {
          name: 'intField4',
          array: true,
          type: 'intFields',
        },
        {
          name: 'intField5',
          default: [55],
          required: true,
          array: true,
          type: 'intFields',
        },
      ],
    };
    const expectedResult = [
      'ExampleCreateInput',
      `input ExampleCreateInput {
  id: ID
  intField1: Int
  intField2: Int
  intField3: Int!
  intField4: [Int!]
  intField5: [Int!]!
}
input ExampleCreateChildInput {
  connect: ID
  create: ExampleCreateInput
}
input ExampleCreateOrPushChildrenInput {
  connect: [ID!]
  create: [ExampleCreateInput!]
  createPositions: [Int!]
}`,
      {},
    ];

    const result = createEntityCreateInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity type with float fields', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      floatFields: [
        {
          name: 'floatField1',
          type: 'floatFields',
        },
        {
          name: 'floatField2',
          default: 0,
          type: 'floatFields',
        },
        {
          name: 'floatField3',
          required: true,
          type: 'floatFields',
        },
        {
          name: 'floatField4',
          array: true,
          type: 'floatFields',
        },
        {
          name: 'floatField5',
          default: [5.5],
          required: true,
          array: true,
          type: 'floatFields',
        },
      ],
    };
    const expectedResult = [
      'ExampleCreateInput',
      `input ExampleCreateInput {
  id: ID
  floatField1: Float
  floatField2: Float
  floatField3: Float!
  floatField4: [Float!]
  floatField5: [Float!]!
}
input ExampleCreateChildInput {
  connect: ID
  create: ExampleCreateInput
}
input ExampleCreateOrPushChildrenInput {
  connect: [ID!]
  create: [ExampleCreateInput!]
  createPositions: [Int!]
}`,
      {},
    ];

    const result = createEntityCreateInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity type with boolean fields', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      booleanFields: [
        {
          name: 'booleanField1',
          type: 'booleanFields',
        },
        {
          name: 'booleanField2',
          default: false,
          type: 'booleanFields',
        },
        {
          name: 'booleanField3',
          required: true,
          type: 'booleanFields',
        },
        {
          name: 'booleanField4',
          array: true,
          type: 'booleanFields',
        },
        {
          name: 'booleanField5',
          default: [true, true],
          required: true,
          array: true,
          type: 'booleanFields',
        },
      ],
    };
    const expectedResult = [
      'ExampleCreateInput',
      `input ExampleCreateInput {
  id: ID
  booleanField1: Boolean
  booleanField2: Boolean
  booleanField3: Boolean!
  booleanField4: [Boolean!]
  booleanField5: [Boolean!]!
}
input ExampleCreateChildInput {
  connect: ID
  create: ExampleCreateInput
}
input ExampleCreateOrPushChildrenInput {
  connect: [ID!]
  create: [ExampleCreateInput!]
  createPositions: [Int!]
}`,
      {},
    ];

    const result = createEntityCreateInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
