// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createPushIntoThingInputType from './createPushIntoThingInputType';

describe('createPushIntoThingInputType', () => {
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
    const expectedResult = `input PushIntoExampleInput {
  textField4: [String!]
  textField5: [String!]
}`;

    const result = createPushIntoThingInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type with only scalar text fields', () => {
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
      ],
    };
    const expectedResult = '';

    const result = createPushIntoThingInputType(thingConfig);
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
    const expectedResult = `input PushIntoPersonInput {
  friends: PersonCreateOrPushChildrenInput
  enemies: PersonCreateOrPushChildrenInput
}`;

    const result = createPushIntoThingInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create embedded thing input type with text fields', () => {
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
        {
          name: 'tags',
          array: true,
        },
      ],
    };
    const expectedResult = '';

    const result = createPushIntoThingInputType(addressConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type with embedded fields', () => {
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
      ],
    };
    const expectedResult = `input PushIntoPersonInput {
  locations: [AddressCreateInput!]
  places: [AddressCreateInput!]
}`;

    const result = createPushIntoThingInputType(personConfig);
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
    const expectedResult = `input PushIntoPersonInput {
  friends: PersonCreateOrPushChildrenInput
  enemies: PersonCreateOrPushChildrenInput
}`;

    const result = createPushIntoThingInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type with geospatial fields', () => {
    const thingConfig = {
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
    const expectedResult = `input PushIntoExampleInput {
  favoritePositions: [GeospatialPointInput!]
  worstPositions: [GeospatialPointInput!]
  favoriteAreas: [GeospatialPolygonInput!]
  worstAreas: [GeospatialPolygonInput!]
}`;

    const result = createPushIntoThingInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type with enum fields', () => {
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
      ],
    };
    const expectedResult = `input PushIntoExampleInput {
  field2: [CuisinesEnumeration!]
  field4: [CuisinesEnumeration!]
}`;

    const result = createPushIntoThingInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing type with int fields', () => {
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
      ],
    };
    const expectedResult = `input PushIntoExampleInput {
  intField4: [Int!]
  intField5: [Int!]
}`;

    const result = createPushIntoThingInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing type with float fields', () => {
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
      ],
    };
    const expectedResult = `input PushIntoExampleInput {
  floatField4: [Float!]
  floatField5: [Float!]
}`;

    const result = createPushIntoThingInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing type with boolean fields', () => {
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
      ],
    };
    const expectedResult = `input PushIntoExampleInput {
  booleanField4: [Boolean!]
  booleanField5: [Boolean!]
}`;

    const result = createPushIntoThingInputType(thingConfig);
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
    const expectedResult = '';

    const result = createPushIntoThingInputType(imageConfig);
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
      ],
    });

    const expectedResult = `input PushIntoExampleInput {
  pictures: [ImageCreateInput!]
  photos: [ImageCreateInput!]
}`;

    const result = createPushIntoThingInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
