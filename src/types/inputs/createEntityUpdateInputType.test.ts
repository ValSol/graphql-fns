/* eslint-env jest */

import type { EmbeddedEntityConfig, FileEntityConfig, TangibleEntityConfig } from '../../tsTypes';

import createEntityCreateInputType from './createEntityCreateInputType';
import createEntityUpdateInputType from './createEntityUpdateInputType';

describe('createEntityUpdateInputType', () => {
  test('should create entity update input type with text fields', () => {
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
        {
          name: 'textField6',
          freeze: true,
          type: 'textFields',
        },
        {
          name: 'textField7',
          array: true,
          freeze: true,
          type: 'textFields',
        },
      ],
    };
    const expectedResult = [
      'ExampleUpdateInput',
      `input ExampleUpdateInput {
  textField1: String
  textField2: String
  textField3: String
  textField4: [String!]
  textField5: [String!]
}`,
      {},
    ];

    const result = createEntityUpdateInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity update input type with relational fields', () => {
    const personConfig = {} as TangibleEntityConfig;

    const placeConfig: TangibleEntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name', type: 'textFields' }],
      relationalFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'customers',
          oppositeName: 'favoritePlace',
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
      'PersonUpdateInput',
      `input PersonUpdateInput {
  friends: PersonCreateOrPushChildrenInput
  enemies: PersonCreateOrPushChildrenInput
  location: PlaceCreateChildInput
  favoritePlace: PlaceCreateChildInput
}`,
      {
        PlaceCreateInput: [createEntityCreateInputType, placeConfig],
        PersonCreateInput: [createEntityCreateInputType, personConfig],
      },
    ];

    const result = createEntityUpdateInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create empty input type with relational fields', () => {
    const personConfig = {} as TangibleEntityConfig;

    const placeConfig: TangibleEntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name', type: 'textFields' }],
      relationalFields: [
        {
          name: 'citizens',
          oppositeName: 'location',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'customers',
          oppositeName: 'favoritePlace',
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
          name: 'location',
          oppositeName: 'citizens',
          config: placeConfig,
          required: true,
          freeze: true,
          type: 'relationalFields',
        },
        {
          name: 'favoritePlace',
          oppositeName: 'customers',
          config: placeConfig,
          freeze: true,
          type: 'relationalFields',
        },
      ],
    });
    const expectedResult = ['PersonUpdateInput', '', {}];

    const result = createEntityUpdateInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity update input type with duplex fields', () => {
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
      'PersonUpdateInput',
      `input PersonUpdateInput {
  firstName: String
  lastName: String
  friends: PersonCreateOrPushThru_friends_FieldChildrenInput
  enemies: PersonCreateOrPushChildrenInput
  location: PlaceCreateChildInput
  favoritePlace: PlaceCreateThru_visitors_FieldChildInput
}`,
      {
        PlaceCreateInput: [createEntityCreateInputType, placeConfig],
        PersonCreateInput: [createEntityCreateInputType, personConfig],
      },
    ];

    const result = createEntityUpdateInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity update input type with embedded fields', () => {
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
        {
          name: 'places2',
          array: true,
          config: addressConfig,
          freeze: true,
          type: 'embeddedFields',
          variants: ['plain'],
        },
      ],
    };
    const expectedResult = [
      'PersonUpdateInput',
      `input PersonUpdateInput {
  firstName: String
  lastName: String
  location: AddressUpdateInput
  locations: [AddressUpdateInput!]
  place: AddressUpdateInput
  places: [AddressUpdateInput!]
}`,
      {
        AddressUpdateInput: [createEntityUpdateInputType, addressConfig],
      },
    ];

    const result = createEntityUpdateInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity update input type with text fields', () => {
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
          name: 'worstPositions2',
          array: true,
          geospatialType: 'Point',
          freeze: true,
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
      'ExampleUpdateInput',
      `input ExampleUpdateInput {
  position: GeospatialPointInput
  precedingPosition: GeospatialPointInput
  favoritePositions: [GeospatialPointInput!]
  worstPositions: [GeospatialPointInput!]
  area: GeospatialPolygonInput
  precedingArea: GeospatialPolygonInput
  favoriteAreas: [GeospatialPolygonInput!]
  worstAreas: [GeospatialPolygonInput!]
}`,
      {},
    ];
    const result = createEntityUpdateInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity update input type with enum fields', () => {
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
        {
          name: 'field5',
          array: true,
          enumName: 'Cuisines',
          required: true,
          freeze: true,
          type: 'enumFields',
        },
      ],
    };

    const expectedResult = [
      'ExampleUpdateInput',
      `input ExampleUpdateInput {
  field1: WeekdaysEnumeration
  field2: [CuisinesEnumeration!]
  field3: WeekdaysEnumeration
  field4: [CuisinesEnumeration!]
}`,
      {},
    ];

    const result = createEntityUpdateInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity update input type with int fields', () => {
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
        {
          name: 'intField5',
          required: true,
          array: true,
          freeze: true,
          type: 'intFields',
        },
      ],
    };
    const expectedResult = [
      'ExampleUpdateInput',
      `input ExampleUpdateInput {
  intField1: Int
  intField2: Int
  intField3: Int
  intField4: [Int!]
  intField5: [Int!]
}`,
      {},
    ];

    const result = createEntityUpdateInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity update input type with float fields', () => {
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
        {
          name: 'floatField5',
          required: true,
          array: true,
          freeze: true,
          type: 'floatFields',
        },
      ],
    };
    const expectedResult = [
      'ExampleUpdateInput',
      `input ExampleUpdateInput {
  floatField1: Float
  floatField2: Float
  floatField3: Float
  floatField4: [Float!]
  floatField5: [Float!]
}`,
      {},
    ];

    const result = createEntityUpdateInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity update input type with boolean fields', () => {
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
        {
          name: 'booleanField5',
          required: true,
          array: true,
          freeze: true,
          type: 'booleanFields',
        },
      ],
    };
    const expectedResult = [
      'ExampleUpdateInput',
      `input ExampleUpdateInput {
  booleanField1: Boolean
  booleanField2: Boolean
  booleanField3: Boolean
  booleanField4: [Boolean!]
  booleanField5: [Boolean!]
}`,
      {},
    ];

    const result = createEntityUpdateInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create file entity input type with text fields', () => {
    const imageConfig: FileEntityConfig = {
      name: 'Image',
      type: 'file',
      textFields: [
        {
          name: 'fileId',
          required: true,
          type: 'textFields',
        },
        {
          name: 'comment',
          type: 'textFields',
        },
      ],
    };
    const expectedResult = [
      'ImageUpdateInput',
      `input ImageUpdateInput {
  fileId: String
  comment: String
}`,
      {},
    ];

    const result = createEntityUpdateInputType(imageConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type with file fields', () => {
    const imageConfig: FileEntityConfig = {
      name: 'Image',
      type: 'file',
      textFields: [
        {
          name: 'fileId',
          type: 'textFields',
        },
        {
          name: 'address',
          type: 'textFields',
        },
      ],
    };
    const photoConfig: FileEntityConfig = {
      name: 'Photo',
      type: 'file',
      textFields: [
        {
          name: 'fileId',
          type: 'textFields',
        },
        {
          name: 'address',
          type: 'textFields',
        },
      ],
    };

    const entityConfig = {} as TangibleEntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
      ],
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
          required: true,
          type: 'fileFields',
          variants: ['plain'],
        },
        {
          name: 'hero',
          config: imageConfig,
          type: 'fileFields',
          variants: ['plain'],
        },
        {
          name: 'pictures',
          config: imageConfig,
          array: true,
          required: true,
          type: 'fileFields',
          variants: ['plain'],
        },
        {
          name: 'photos',
          config: imageConfig,
          array: true,
          type: 'fileFields',
          variants: ['plain'],
        },
        {
          name: 'photo',
          config: photoConfig,
          freeze: true,
          type: 'fileFields',
          variants: ['plain'],
        },
      ],
    });

    const expectedResult = [
      'ExampleUpdateInput',
      `input ExampleUpdateInput {
  textField: String
  logo: ImageUpdateInput
  hero: ImageUpdateInput
  pictures: [ImageUpdateInput!]
  photos: [ImageUpdateInput!]
}`,
      {
        ImageUpdateInput: [createEntityUpdateInputType, imageConfig],
      },
    ];

    const result = createEntityUpdateInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
