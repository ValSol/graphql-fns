// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import createPushIntoEntityInputType from './createPushIntoEntityInputType';
import createEntityCreateInputType from './createEntityCreateInputType';

describe('createPushIntoEntityInputType', () => {
  test('should create entity input type with text fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
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
          default: ['default text'],
          required: true,
          array: true,
          freeze: true,
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
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
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
          freeze: true,
        },
      ],
    };
    const expectedResult = ['PushIntoExampleInput', '', {}];

    const result = createPushIntoEntityInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type with only freeze array text fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField1',
          array: true,
          freeze: true,
        },
        {
          name: 'textField2',
          required: true,
          array: true,
          freeze: true,
        },
      ],
    };
    const expectedResult = ['PushIntoExampleInput', '', {}];

    const result = createPushIntoEntityInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type with relational fields', () => {
    const placeConfig: EntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name' }],
    };
    const personConfig: EntityConfig = {};
    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
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
        },
        {
          name: 'location',
          config: placeConfig,
          required: true,
          array: true,
        },
        {
          name: 'favoritePlace',
          config: placeConfig,
        },
        {
          name: 'location2',
          config: placeConfig,
          required: true,
          array: true,
          freeze: true,
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
    const addressConfig: EntityConfig = {
      name: 'Address',
      type: 'embedded',
      textFields: [
        {
          name: 'country',
          required: true,
          default: 'Ukraine',
        },
        {
          name: 'province',
        },
        {
          name: 'tags',
          array: true,
        },
      ],
    };
    const expectedResult = ['PushIntoAddressInput', '', {}];

    const result = createPushIntoEntityInputType(addressConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type with embedded fields', () => {
    const addressConfig: EntityConfig = {
      name: 'Address',
      type: 'embedded',
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
    const personConfig: EntityConfig = {
      name: 'Person',
      type: 'tangible',
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
    const personConfig: EntityConfig = {};
    const placeConfig: EntityConfig = {
      name: 'Place',
      type: 'tangible',
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
        {
          name: 'visitors2',
          oppositeName: 'favoritePlace',
          array: true,
          config: personConfig,
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
        {
          name: 'favoritePlace2',
          oppositeName: 'visitors2',
          config: placeConfig,
          freeze: true,
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

  test('should create entity input type with geospatial fields', () => {
    const entityConfig = {
      name: 'Example',
      type: 'tangible',
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
          name: 'favoritePositions2',
          array: true,
          geospatialType: 'Point',
          required: true,
          freeze: true,
        },
        {
          name: 'worstPositions',
          array: true,
          geospatialType: 'Point',
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
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
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
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
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
          name: 'intField6',
          required: true,
          array: true,
          freeze: true,
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
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
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
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
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
          name: 'booleanField6',
          required: true,
          array: true,
          freeze: true,
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
    const imageConfig: EntityConfig = {
      name: 'Image',
      type: 'file',
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
    const expectedResult = ['PushIntoImageInput', '', {}];

    const result = createPushIntoEntityInputType(imageConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type with file fields', () => {
    const imageConfig: EntityConfig = {
      name: 'Image',
      type: 'file',
      textFields: [
        {
          name: 'fileId',
        },
        {
          name: 'address',
        },
      ],
    };

    const entityConfig: EntityConfig = {};
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
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
          name: 'photos2',
          config: imageConfig,
          array: true,
          freeze: true,
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
