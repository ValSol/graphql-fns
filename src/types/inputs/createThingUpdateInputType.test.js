// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createThingCreateInputType from './createThingCreateInputType';
import createThingUpdateInputType from './createThingUpdateInputType';

describe('createThingUpdateInputType', () => {
  test('should create thing update input type with text fields', () => {
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
        {
          name: 'textField6',
          freeze: true,
        },
        {
          name: 'textField7',
          array: true,
          freeze: true,
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

    const result = createThingUpdateInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing update input type with relational fields', () => {
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
    const expectedResult = [
      'PersonUpdateInput',
      `input PersonUpdateInput {
  friends: PersonCreateOrPushChildrenInput
  enemies: PersonCreateOrPushChildrenInput
  location: PlaceCreateChildInput
  favoritePlace: PlaceCreateChildInput
}`,
      {
        PlaceCreateInput: [createThingCreateInputType, placeConfig],
        PersonCreateInput: [createThingCreateInputType, personConfig],
      },
    ];

    const result = createThingUpdateInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create empty input type with relational fields', () => {
    const placeConfig: ThingConfig = {
      name: 'Place',
      textFields: [{ name: 'name' }],
    };
    const personConfig: ThingConfig = {};
    Object.assign(personConfig, {
      name: 'Person',
      relationalFields: [
        {
          name: 'location',
          config: placeConfig,
          required: true,
          freeze: true,
        },
        {
          name: 'favoritePlace',
          config: placeConfig,
          freeze: true,
        },
      ],
    });
    const expectedResult = ['PersonUpdateInput', '', {}];

    const result = createThingUpdateInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing update input type with duplex fields', () => {
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
          required: true,
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
        PlaceCreateInput: [createThingCreateInputType, placeConfig],
        PersonCreateInput: [createThingCreateInputType, personConfig],
      },
    ];

    const result = createThingUpdateInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing update input type with embedded fields', () => {
    const addressConfig: ThingConfig = {
      name: 'Address',
      embedded: true,
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
        {
          name: 'places2',
          array: true,
          config: addressConfig,
          freeze: true,
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
        AddressUpdateInput: [createThingUpdateInputType, addressConfig],
      },
    ];

    const result = createThingUpdateInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing update input type with text fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      geospatialFields: [
        {
          name: 'position',
          geospatialType: 'Point',
          required: true,
        },
        {
          name: 'precedingPosition',
          geospatialType: 'Point',
        },
        {
          name: 'favoritePositions',
          array: true,
          geospatialType: 'Point',
          required: true,
        },
        {
          name: 'worstPositions',
          array: true,
          geospatialType: 'Point',
        },
        {
          name: 'worstPositions2',
          array: true,
          geospatialType: 'Point',
          freeze: true,
        },
        {
          name: 'area',
          geospatialType: 'Polygon',
          required: true,
        },
        {
          name: 'precedingArea',
          geospatialType: 'Polygon',
        },
        {
          name: 'favoriteAreas',
          array: true,
          geospatialType: 'Polygon',
          required: true,
        },
        {
          name: 'worstAreas',
          array: true,
          geospatialType: 'Polygon',
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
    const result = createThingUpdateInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing update input type with enum fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      enumFields: [
        {
          name: 'field1',
          enumName: 'Weekdays',
        },
        {
          name: 'field2',
          array: true,
          enumName: 'Cuisines',
        },
        {
          name: 'field3',
          enumName: 'Weekdays',
          required: true,
        },
        {
          name: 'field4',
          array: true,
          enumName: 'Cuisines',
          required: true,
        },
        {
          name: 'field5',
          array: true,
          enumName: 'Cuisines',
          required: true,
          freeze: true,
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

    const result = createThingUpdateInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing update input type with int fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      intFields: [
        {
          name: 'intField1',
        },
        {
          name: 'intField2',
          default: 0,
        },
        {
          name: 'intField3',
          required: true,
        },
        {
          name: 'intField4',
          array: true,
        },
        {
          name: 'intField5',
          default: [55],
          required: true,
          array: true,
        },
        {
          name: 'intField5',
          required: true,
          array: true,
          freeze: true,
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

    const result = createThingUpdateInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing update input type with float fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      floatFields: [
        {
          name: 'floatField1',
        },
        {
          name: 'floatField2',
          default: 0,
        },
        {
          name: 'floatField3',
          required: true,
        },
        {
          name: 'floatField4',
          array: true,
        },
        {
          name: 'floatField5',
          default: [5.5],
          required: true,
          array: true,
        },
        {
          name: 'floatField5',
          required: true,
          array: true,
          freeze: true,
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

    const result = createThingUpdateInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing update input type with boolean fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      booleanFields: [
        {
          name: 'booleanField1',
        },
        {
          name: 'booleanField2',
          default: false,
        },
        {
          name: 'booleanField3',
          required: true,
        },
        {
          name: 'booleanField4',
          array: true,
        },
        {
          name: 'booleanField5',
          default: [true, true],
          required: true,
          array: true,
        },
        {
          name: 'booleanField5',
          required: true,
          array: true,
          freeze: true,
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

    const result = createThingUpdateInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create file thing input type with text fields', () => {
    const imageConfig: ThingConfig = {
      name: 'Image',
      file: true,
      textFields: [
        {
          name: 'fileId',
          required: true,
        },
        {
          name: 'comment',
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

    const result = createThingUpdateInputType(imageConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type with file fields', () => {
    const imageConfig: ThingConfig = {
      name: 'Image',
      file: true,
      textFields: [
        {
          name: 'fileId',
        },
        {
          name: 'address',
        },
      ],
    };
    const photoConfig: ThingConfig = {
      name: 'Photo',
      file: true,
      textFields: [
        {
          name: 'fileId',
        },
        {
          name: 'address',
        },
      ],
    };

    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
          required: true,
        },
        {
          name: 'hero',
          config: imageConfig,
        },
        {
          name: 'pictures',
          config: imageConfig,
          array: true,
          required: true,
        },
        {
          name: 'photos',
          config: imageConfig,
          array: true,
        },
        {
          name: 'photo',
          config: photoConfig,
          freeze: true,
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
        ImageUpdateInput: [createThingUpdateInputType, imageConfig],
      },
    ];

    const result = createThingUpdateInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
