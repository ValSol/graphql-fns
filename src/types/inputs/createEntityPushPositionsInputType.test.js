// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import createEntityPushPositionsInputType from './createEntityPushPositionsInputType';

describe('createEntityPushPositionsInputType', () => {
  test('should create entity reorder input type with text fields', () => {
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
      ],
    };
    const expectedResult = [
      'ExamplePushPositionsInput',
      `input ExamplePushPositionsInput {
  textField4: [Int!]
  textField5: [Int!]
}`,
      {},
    ];

    const result = createEntityPushPositionsInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity reorder input type with relational fields', () => {
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
      'PersonPushPositionsInput',
      `input PersonPushPositionsInput {
  friends: [Int!]
  enemies: [Int!]
}`,
      {},
    ];

    const result = createEntityPushPositionsInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity reorder input type with duplex fields', () => {
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
      ],
    };
    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
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
      'PersonPushPositionsInput',
      `input PersonPushPositionsInput {
  friends: [Int!]
  enemies: [Int!]
}`,
      {},
    ];

    const result = createEntityPushPositionsInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity reorder input type with embedded fields', () => {
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
      ],
    };
    const expectedResult = [
      'PersonPushPositionsInput',
      `input PersonPushPositionsInput {
  locations: [Int!]
  places: [Int!]
}`,
      {},
    ];

    const result = createEntityPushPositionsInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity reorder input type with text fields', () => {
    const entityConfig: EntityConfig = {
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
      'ExamplePushPositionsInput',
      `input ExamplePushPositionsInput {
  favoritePositions: [Int!]
  worstPositions: [Int!]
  favoriteAreas: [Int!]
  worstAreas: [Int!]
}`,
      {},
    ];
    const result = createEntityPushPositionsInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity reorder input type with enum fields', () => {
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
      ],
    };

    const expectedResult = [
      'ExamplePushPositionsInput',
      `input ExamplePushPositionsInput {
  field2: [Int!]
  field4: [Int!]
}`,
      {},
    ];

    const result = createEntityPushPositionsInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity reorder input type with int fields', () => {
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
      ],
    };
    const expectedResult = [
      'ExamplePushPositionsInput',
      `input ExamplePushPositionsInput {
  intField4: [Int!]
  intField5: [Int!]
}`,
      {},
    ];

    const result = createEntityPushPositionsInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity reorder input type with float fields', () => {
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
      ],
    };
    const expectedResult = [
      'ExamplePushPositionsInput',
      `input ExamplePushPositionsInput {
  floatField4: [Int!]
  floatField5: [Int!]
}`,
      {},
    ];

    const result = createEntityPushPositionsInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity reorder input type with boolean fields', () => {
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
      ],
    };
    const expectedResult = [
      'ExamplePushPositionsInput',
      `input ExamplePushPositionsInput {
  booleanField4: [Int!]
  booleanField5: [Int!]
}`,
      {},
    ];

    const result = createEntityPushPositionsInputType(entityConfig);
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
    const expectedResult = ['ImagePushPositionsInput', '', {}];

    const result = createEntityPushPositionsInputType(imageConfig);
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
          name: 'logos',
          config: imageConfig,
          required: true,
          array: true,
          freeze: true,
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
      ],
    });

    const expectedResult = [
      'ExamplePushPositionsInput',
      `input ExamplePushPositionsInput {
  pictures: [Int!]
  photos: [Int!]
}`,
      {},
    ];

    const result = createEntityPushPositionsInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create empty input type with file fields', () => {
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
          freeze: true,
        },
        {
          name: 'photos',
          config: imageConfig,
          array: true,
          freeze: true,
        },
      ],
    });

    const expectedResult = ['ExamplePushPositionsInput', '', {}];

    const result = createEntityPushPositionsInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create empty input type with file fields', () => {
    const entityConfig: EntityConfig = {};
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
    });

    const expectedResult = ['ExamplePushPositionsInput', '', {}];

    const result = createEntityPushPositionsInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
