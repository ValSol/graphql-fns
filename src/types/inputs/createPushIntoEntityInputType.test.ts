/* eslint-env jest */

import type { EmbeddedEntityConfig, FileEntityConfig, TangibleEntityConfig } from '../../tsTypes';

import createPushIntoEntityInputType from './createPushIntoEntityInputType';
import createEntityCreateInputType from './createEntityCreateInputType';
import createEntityWhereInputType from './createEntityWhereInputType';
import createEntityWhereOneInputType from './createEntityWhereOneInputType';

describe('createPushIntoEntityInputType', () => {
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
        {
          name: 'textField6',
          default: ['default text'],
          required: true,
          array: true,
          freeze: true,
          type: 'textFields',
        },
      ],
    };
    const expectedResult = [
      'PushIntoExampleInput',
      `input PushIntoExampleInput {
  textField4: [String!]
  textField5: [String!]
}`,
      {},
    ];

    const result = createPushIntoEntityInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type with only scalar text fields', () => {
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
          freeze: true,
          type: 'textFields',
        },
      ],
    };
    const expectedResult = ['PushIntoExampleInput', '', {}];

    const result = createPushIntoEntityInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type with only freeze array text fields', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
          array: true,
          freeze: true,
          type: 'textFields',
        },
        {
          name: 'textField2',
          required: true,
          array: true,
          freeze: true,
          type: 'textFields',
        },
      ],
    };
    const expectedResult = ['PushIntoExampleInput', '', {}];

    const result = createPushIntoEntityInputType(entityConfig);
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
        {
          name: 'citizens2',
          oppositeName: 'location2',
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
          array: true,
          type: 'relationalFields',
        },
        {
          name: 'favoritePlace',
          oppositeName: 'customers',
          config: placeConfig,
          type: 'relationalFields',
        },
        {
          name: 'location2',
          oppositeName: 'citizens2',
          config: placeConfig,
          required: true,
          array: true,
          freeze: true,
          type: 'relationalFields',
        },
      ],
    });
    const expectedResult = [
      'PushIntoPersonInput',
      `input PushIntoPersonInput {
  friends: PersonCreateOrPushChildrenInput
  location: PlaceCreateOrPushChildrenInput
}`,
    ];

    const result = createPushIntoEntityInputType(personConfig);

    const [nexus1, nexus2, nexus3] = result;

    expect([nexus1, nexus2]).toEqual(expectedResult);

    expect(nexus3.PersonCreateInput).toEqual([createEntityCreateInputType, personConfig]);
    expect(nexus3.PlaceCreateInput).toEqual([createEntityCreateInputType, placeConfig]);
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
        {
          name: 'tags',
          array: true,
          type: 'textFields',
        },
      ],
    };
    const expectedResult = ['PushIntoAddressInput', '', {}];

    const result = createPushIntoEntityInputType(addressConfig);
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
      'PushIntoPersonInput',
      `input PushIntoPersonInput {
  locations: [AddressCreateInput!]
  places: [AddressCreateInput!]
}`,
      { AddressCreateInput: [createEntityCreateInputType, addressConfig] },
    ];

    const result = createPushIntoEntityInputType(personConfig);

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
          type: 'duplexFields',
        },
        {
          name: 'visitors2',
          oppositeName: 'favoritePlace',
          array: true,
          config: personConfig,
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
        {
          name: 'favoritePlace2',
          oppositeName: 'visitors2',
          config: placeConfig,
          freeze: true,
          type: 'duplexFields',
        },
      ],
    });
    const expectedResult = [
      'PushIntoPersonInput',
      `input PushIntoPersonInput {
  friends: PersonCreateOrPushChildrenInput
  enemies: PersonCreateOrPushChildrenInput
}`,
      {
        PersonCreateInput: [createEntityCreateInputType, personConfig],
      },
    ];

    const result = createPushIntoEntityInputType(personConfig);

    expect(result).toEqual(expectedResult);
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
      'PushIntoPersonInput',
      `input PushIntoPersonInput {
  places: PlaceWhereInput
  place: PlaceWhereOneInput
  requiredPlaces: PlaceWhereInput
  requiredPlace: PlaceWhereOneInput
}`,
      {
        PlaceWhereInput: [createEntityWhereInputType, placeConfig],
        PlaceWhereOneInput: [createEntityWhereOneInputType, placeConfig],
      },
    ];

    const result = createPushIntoEntityInputType(personConfig);

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
          name: 'favoritePositions2',
          array: true,
          geospatialType: 'Point',
          required: true,
          freeze: true,
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
      'PushIntoExampleInput',
      `input PushIntoExampleInput {
  favoritePositions: [GeospatialPointInput!]
  worstPositions: [GeospatialPointInput!]
  favoriteAreas: [GeospatialPolygonInput!]
  worstAreas: [GeospatialPolygonInput!]
}`,
      {},
    ];

    const result = createPushIntoEntityInputType(entityConfig);
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
      'PushIntoExampleInput',
      `input PushIntoExampleInput {
  field2: [CuisinesEnumeration!]
  field4: [CuisinesEnumeration!]
}`,
      {},
    ];

    const result = createPushIntoEntityInputType(entityConfig);
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
        {
          name: 'intField6',
          required: true,
          array: true,
          freeze: true,
          type: 'intFields',
        },
      ],
    };
    const expectedResult = [
      'PushIntoExampleInput',
      `input PushIntoExampleInput {
  intField4: [Int!]
  intField5: [Int!]
}`,
      {},
    ];

    const result = createPushIntoEntityInputType(entityConfig);
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
      'PushIntoExampleInput',
      `input PushIntoExampleInput {
  floatField4: [Float!]
  floatField5: [Float!]
}`,
      {},
    ];

    const result = createPushIntoEntityInputType(entityConfig);
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
        {
          name: 'booleanField6',
          required: true,
          array: true,
          freeze: true,
          type: 'booleanFields',
        },
      ],
    };
    const expectedResult = [
      'PushIntoExampleInput',
      `input PushIntoExampleInput {
  booleanField4: [Boolean!]
  booleanField5: [Boolean!]
}`,
      {},
    ];

    const result = createPushIntoEntityInputType(entityConfig);
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
    const expectedResult = ['PushIntoImageInput', '', {}];

    const result = createPushIntoEntityInputType(imageConfig);
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
          name: 'photos2',
          config: imageConfig,
          array: true,
          freeze: true,
          type: 'fileFields',
          variants: ['plain'],
        },
      ],
    });

    const expectedResult = [
      'PushIntoExampleInput',
      `input PushIntoExampleInput {
  pictures: [ImageCreateInput!]
  photos: [ImageCreateInput!]
}`,
      {
        ImageCreateInput: [createEntityCreateInputType, imageConfig],
      },
    ];

    const result = createPushIntoEntityInputType(entityConfig);

    expect(result).toEqual(expectedResult);
  });
});
