/* eslint-env jest */
import type { EmbeddedEntityConfig, TangibleEntityConfig } from '../../tsTypes';

import createEntityWherePayloadInputType from './createEntityWherePayloadInputType';

describe('createEntityWherePayloadInputType', () => {
  test('should create empty string if there are not any index fields', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          type: 'textFields',
        },
        {
          name: 'lastName',
          type: 'textFields',
        },
        {
          name: 'code',
          unique: true,
          type: 'textFields',
        },
      ],
    };
    const expectedResult = [
      'ExampleWherePayloadInput',
      `input ExampleWherePayloadInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  firstName: String
  firstName_in: [String!]
  firstName_nin: [String!]
  firstName_ne: String
  firstName_gt: String
  firstName_gte: String
  firstName_lt: String
  firstName_lte: String
  firstName_re: [RegExp!]
  firstName_exists: Boolean
  lastName: String
  lastName_in: [String!]
  lastName_nin: [String!]
  lastName_ne: String
  lastName_gt: String
  lastName_gte: String
  lastName_lt: String
  lastName_lte: String
  lastName_re: [RegExp!]
  lastName_exists: Boolean
  code: String
  code_in: [String!]
  code_nin: [String!]
  code_ne: String
  code_gt: String
  code_gte: String
  code_lt: String
  code_lte: String
  code_re: [RegExp!]
  code_exists: Boolean
  AND: [ExampleWherePayloadInput!]
  NOR: [ExampleWherePayloadInput!]
  OR: [ExampleWherePayloadInput!]
}`,
      {},
    ];

    const result = createEntityWherePayloadInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type if there are text index fields', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          index: true,
          type: 'textFields',
        },
        {
          name: 'lastName',
          index: true,
          type: 'textFields',
        },
      ],
    };
    const expectedResult = [
      'ExampleWherePayloadInput',
      `input ExampleWherePayloadInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  firstName: String
  firstName_in: [String!]
  firstName_nin: [String!]
  firstName_ne: String
  firstName_gt: String
  firstName_gte: String
  firstName_lt: String
  firstName_lte: String
  firstName_re: [RegExp!]
  firstName_exists: Boolean
  lastName: String
  lastName_in: [String!]
  lastName_nin: [String!]
  lastName_ne: String
  lastName_gt: String
  lastName_gte: String
  lastName_lt: String
  lastName_lte: String
  lastName_re: [RegExp!]
  lastName_exists: Boolean
  AND: [ExampleWherePayloadInput!]
  NOR: [ExampleWherePayloadInput!]
  OR: [ExampleWherePayloadInput!]
}`,
      {},
    ];

    const result = createEntityWherePayloadInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type if there are relational index fields', () => {
    const personConfig = {} as TangibleEntityConfig;
    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          index: true,
          type: 'textFields',
        },
        {
          name: 'lastName',
          index: true,
          type: 'textFields',
        },
      ],

      relationalFields: [
        {
          name: 'spouse',
          oppositeName: 'partners',
          config: personConfig,
          index: true,
          type: 'relationalFields',
        },
        {
          name: 'partners',
          oppositeName: 'spouse',
          config: personConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
        },
        {
          name: 'friends',
          oppositeName: 'fellows',
          config: personConfig,
          index: true,
          array: true,
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
      ],
    });
    const expectedResult = [
      'PersonWherePayloadInput',
      `input PersonWherePayloadInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  firstName: String
  firstName_in: [String!]
  firstName_nin: [String!]
  firstName_ne: String
  firstName_gt: String
  firstName_gte: String
  firstName_lt: String
  firstName_lte: String
  firstName_re: [RegExp!]
  firstName_exists: Boolean
  lastName: String
  lastName_in: [String!]
  lastName_nin: [String!]
  lastName_ne: String
  lastName_gt: String
  lastName_gte: String
  lastName_lt: String
  lastName_lte: String
  lastName_re: [RegExp!]
  lastName_exists: Boolean
  spouse: ID
  spouse_in: [ID!]
  spouse_nin: [ID!]
  spouse_ne: ID
  spouse_exists: Boolean
  friends: ID
  friends_in: [ID!]
  friends_nin: [ID!]
  friends_ne: ID
  friends_size: Int
  friends_notsize: Int
  AND: [PersonWherePayloadInput!]
  NOR: [PersonWherePayloadInput!]
  OR: [PersonWherePayloadInput!]
}`,
      {},
    ];

    const result = createEntityWherePayloadInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type if there are duplex index fields', () => {
    const personConfig = {} as TangibleEntityConfig;
    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          index: true,
          type: 'textFields',
        },
        {
          name: 'lastName',
          index: true,
          type: 'textFields',
        },
      ],

      duplexFields: [
        {
          name: 'spouse',
          config: personConfig,
          index: true,
          oppositeName: 'spouse',
          type: 'duplexFields',
        },
        {
          name: 'friends',
          config: personConfig,
          index: true,
          array: true,
          oppositeName: 'friends',
          type: 'duplexFields',
        },
      ],
    });
    const expectedResult = [
      'PersonWherePayloadInput',
      `input PersonWherePayloadInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  firstName: String
  firstName_in: [String!]
  firstName_nin: [String!]
  firstName_ne: String
  firstName_gt: String
  firstName_gte: String
  firstName_lt: String
  firstName_lte: String
  firstName_re: [RegExp!]
  firstName_exists: Boolean
  lastName: String
  lastName_in: [String!]
  lastName_nin: [String!]
  lastName_ne: String
  lastName_gt: String
  lastName_gte: String
  lastName_lt: String
  lastName_lte: String
  lastName_re: [RegExp!]
  lastName_exists: Boolean
  spouse: ID
  spouse_in: [ID!]
  spouse_nin: [ID!]
  spouse_ne: ID
  spouse_exists: Boolean
  friends: ID
  friends_in: [ID!]
  friends_nin: [ID!]
  friends_ne: ID
  friends_size: Int
  friends_notsize: Int
  AND: [PersonWherePayloadInput!]
  NOR: [PersonWherePayloadInput!]
  OR: [PersonWherePayloadInput!]
}`,
      {},
    ];

    const result = createEntityWherePayloadInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type if there are enum index fields', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      enumFields: [
        {
          name: 'field1',
          enumName: 'Weekdays',
          index: true,
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
          index: true,
          type: 'enumFields',
        },
      ],
    };
    const expectedResult = [
      'ExampleWherePayloadInput',
      `input ExampleWherePayloadInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  field1: WeekdaysEnumeration
  field1_in: [WeekdaysEnumeration!]
  field1_nin: [WeekdaysEnumeration!]
  field1_ne: WeekdaysEnumeration
  field1_re: [RegExp!]
  field1_exists: Boolean
  field2: CuisinesEnumeration
  field2_in: [CuisinesEnumeration!]
  field2_nin: [CuisinesEnumeration!]
  field2_ne: CuisinesEnumeration
  field2_re: [RegExp!]
  field2_size: Int
  field2_notsize: Int
  field3: WeekdaysEnumeration
  field3_in: [WeekdaysEnumeration!]
  field3_nin: [WeekdaysEnumeration!]
  field3_ne: WeekdaysEnumeration
  field3_re: [RegExp!]
  field3_exists: Boolean
  field4: CuisinesEnumeration
  field4_in: [CuisinesEnumeration!]
  field4_nin: [CuisinesEnumeration!]
  field4_ne: CuisinesEnumeration
  field4_re: [RegExp!]
  field4_size: Int
  field4_notsize: Int
  AND: [ExampleWherePayloadInput!]
  NOR: [ExampleWherePayloadInput!]
  OR: [ExampleWherePayloadInput!]
}`,
      {},
    ];

    const result = createEntityWherePayloadInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type if there are int index fields', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      intFields: [
        {
          name: 'firstName',
          index: true,
          type: 'intFields',
        },
        {
          name: 'lastName',
          index: true,
          type: 'intFields',
        },
      ],
    };
    const expectedResult = [
      'ExampleWherePayloadInput',
      `input ExampleWherePayloadInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  firstName: Int
  firstName_in: [Int!]
  firstName_nin: [Int!]
  firstName_ne: Int
  firstName_gt: Int
  firstName_gte: Int
  firstName_lt: Int
  firstName_lte: Int
  firstName_exists: Boolean
  lastName: Int
  lastName_in: [Int!]
  lastName_nin: [Int!]
  lastName_ne: Int
  lastName_gt: Int
  lastName_gte: Int
  lastName_lt: Int
  lastName_lte: Int
  lastName_exists: Boolean
  AND: [ExampleWherePayloadInput!]
  NOR: [ExampleWherePayloadInput!]
  OR: [ExampleWherePayloadInput!]
}`,
      {},
    ];

    const result = createEntityWherePayloadInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type if there are int float fields', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      floatFields: [
        {
          name: 'firstName',
          index: true,
          type: 'floatFields',
        },
        {
          name: 'lastName',
          index: true,
          type: 'floatFields',
        },
      ],
    };
    const expectedResult = [
      'ExampleWherePayloadInput',
      `input ExampleWherePayloadInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  firstName: Float
  firstName_in: [Float!]
  firstName_nin: [Float!]
  firstName_ne: Float
  firstName_gt: Float
  firstName_gte: Float
  firstName_lt: Float
  firstName_lte: Float
  firstName_exists: Boolean
  lastName: Float
  lastName_in: [Float!]
  lastName_nin: [Float!]
  lastName_ne: Float
  lastName_gt: Float
  lastName_gte: Float
  lastName_lt: Float
  lastName_lte: Float
  lastName_exists: Boolean
  AND: [ExampleWherePayloadInput!]
  NOR: [ExampleWherePayloadInput!]
  OR: [ExampleWherePayloadInput!]
}`,
      {},
    ];

    const result = createEntityWherePayloadInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type if there are int dateTime fields', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      dateTimeFields: [
        {
          name: 'firstName',
          index: true,
          type: 'dateTimeFields',
        },
        {
          name: 'lastName',
          index: true,
          type: 'dateTimeFields',
        },
      ],
    };
    const expectedResult = [
      'ExampleWherePayloadInput',
      `input ExampleWherePayloadInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  firstName: DateTime
  firstName_in: [DateTime!]
  firstName_nin: [DateTime!]
  firstName_ne: DateTime
  firstName_gt: DateTime
  firstName_gte: DateTime
  firstName_lt: DateTime
  firstName_lte: DateTime
  firstName_exists: Boolean
  lastName: DateTime
  lastName_in: [DateTime!]
  lastName_nin: [DateTime!]
  lastName_ne: DateTime
  lastName_gt: DateTime
  lastName_gte: DateTime
  lastName_lt: DateTime
  lastName_lte: DateTime
  lastName_exists: Boolean
  AND: [ExampleWherePayloadInput!]
  NOR: [ExampleWherePayloadInput!]
  OR: [ExampleWherePayloadInput!]
}`,
      {},
    ];

    const result = createEntityWherePayloadInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type if there are boolean float fields', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      booleanFields: [
        {
          name: 'firstName',
          index: true,
          type: 'booleanFields',
        },
        {
          name: 'lastName',
          index: true,
          type: 'booleanFields',
        },
      ],
    };
    const expectedResult = [
      'ExampleWherePayloadInput',
      `input ExampleWherePayloadInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  firstName: Boolean
  firstName_ne: Boolean
  firstName_exists: Boolean
  lastName: Boolean
  lastName_ne: Boolean
  lastName_exists: Boolean
  AND: [ExampleWherePayloadInput!]
  NOR: [ExampleWherePayloadInput!]
  OR: [ExampleWherePayloadInput!]
}`,
      {},
    ];

    const result = createEntityWherePayloadInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return inputType with counter field', () => {
    const entityConfig: TangibleEntityConfig = {
      name: 'Example',
      type: 'tangible',
      counter: true,
      textFields: [
        {
          name: 'firstName',
          type: 'textFields',
        },
      ],
    };
    const expectedResult = [
      'ExampleWherePayloadInput',
      `input ExampleWherePayloadInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  counter_in: [Int!]
  counter_nin: [Int!]
  counter_ne: Int
  counter_gt: Int
  counter_gte: Int
  counter_lt: Int
  counter_lte: Int
  firstName: String
  firstName_in: [String!]
  firstName_nin: [String!]
  firstName_ne: String
  firstName_gt: String
  firstName_gte: String
  firstName_lt: String
  firstName_lte: String
  firstName_re: [RegExp!]
  firstName_exists: Boolean
  AND: [ExampleWherePayloadInput!]
  NOR: [ExampleWherePayloadInput!]
  OR: [ExampleWherePayloadInput!]
}`,
      {},
    ];

    const result = createEntityWherePayloadInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type if there are embedded index fields', () => {
    const streetConfig: EmbeddedEntityConfig = {
      name: 'Street',
      type: 'embedded',

      textFields: [
        {
          name: 'title',
          index: true,
          type: 'textFields',
        },
      ],
    };

    const addressConfig: EmbeddedEntityConfig = {
      name: 'Address',
      type: 'embedded',

      textFields: [
        {
          name: 'city',
          index: true,
          type: 'textFields',
        },
      ],

      intFields: [
        {
          name: 'number',
          index: true,
          type: 'intFields',
        },
      ],

      embeddedFields: [
        {
          name: 'street',
          config: streetConfig,
          index: true,
          type: 'embeddedFields',
        },
      ],
    };

    const personConfig: TangibleEntityConfig = {
      name: 'Person',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          index: true,
          type: 'textFields',
        },
        {
          name: 'lastName',
          index: true,
          type: 'textFields',
        },
      ],

      embeddedFields: [
        {
          name: 'address',
          config: addressConfig,
          index: true,
          type: 'embeddedFields',
        },
      ],
    };

    const expectedResult = [
      'PersonWherePayloadInput',
      `input PersonWherePayloadInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  firstName: String
  firstName_in: [String!]
  firstName_nin: [String!]
  firstName_ne: String
  firstName_gt: String
  firstName_gte: String
  firstName_lt: String
  firstName_lte: String
  firstName_re: [RegExp!]
  firstName_exists: Boolean
  lastName: String
  lastName_in: [String!]
  lastName_nin: [String!]
  lastName_ne: String
  lastName_gt: String
  lastName_gte: String
  lastName_lt: String
  lastName_lte: String
  lastName_re: [RegExp!]
  lastName_exists: Boolean
  address: AddressWherePayloadInput
  address_exists: Boolean
  AND: [PersonWherePayloadInput!]
  NOR: [PersonWherePayloadInput!]
  OR: [PersonWherePayloadInput!]
}`,
      { AddressWherePayloadInput: [createEntityWherePayloadInputType, addressConfig] },
    ];

    const result = createEntityWherePayloadInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type for embedded entity', () => {
    const streetConfig: EmbeddedEntityConfig = {
      name: 'Street',
      type: 'embedded',

      textFields: [
        {
          name: 'title',
          index: true,
          type: 'textFields',
        },
      ],
    };

    const addressConfig: EmbeddedEntityConfig = {
      name: 'Address',
      type: 'embedded',

      textFields: [
        {
          name: 'city',
          index: true,
          type: 'textFields',
        },
      ],

      intFields: [
        {
          name: 'number',
          index: true,
          type: 'intFields',
        },
      ],

      embeddedFields: [
        {
          name: 'street',
          config: streetConfig,
          index: true,
          type: 'embeddedFields',
        },
      ],
    };

    const expectedResult = [
      'AddressWherePayloadInput',
      `input AddressWherePayloadInput {
  id_in: [ID!]
  id_nin: [ID!]
  _index: Int
  city: String
  city_in: [String!]
  city_nin: [String!]
  city_ne: String
  city_gt: String
  city_gte: String
  city_lt: String
  city_lte: String
  city_re: [RegExp!]
  city_exists: Boolean
  number: Int
  number_in: [Int!]
  number_nin: [Int!]
  number_ne: Int
  number_gt: Int
  number_gte: Int
  number_lt: Int
  number_lte: Int
  number_exists: Boolean
  street: StreetWherePayloadInput
  street_exists: Boolean
}`,
      { StreetWherePayloadInput: [createEntityWherePayloadInputType, streetConfig] },
    ];

    const result = createEntityWherePayloadInputType(addressConfig);
    expect(result).toEqual(expectedResult);
  });

  describe('calculatedFields', () => {
    test('should create empty string if there are not any index fields', () => {
      const entityConfig: TangibleEntityConfig = {
        name: 'Example',
        type: 'tangible',
        allowedCalculatedWithAsyncFuncFieldNames: ['code'],
        calculatedFields: [
          {
            name: 'firstName',
            type: 'calculatedFields',
            calculatedType: 'textFields',
            func: (() => {}) as any,
          },
          {
            name: 'lastName',
            type: 'calculatedFields',
            calculatedType: 'textFields',
            func: (() => {}) as any,
            asyncFunc: (() => {}) as any,
          },
          {
            name: 'code',
            type: 'calculatedFields',
            calculatedType: 'textFields',
            func: (() => {}) as any,
            asyncFunc: (() => {}) as any,
          },
        ],
      };
      const expectedResult = [
        'ExampleWherePayloadInput',
        `input ExampleWherePayloadInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  firstName: String
  firstName_in: [String!]
  firstName_nin: [String!]
  firstName_ne: String
  firstName_gt: String
  firstName_gte: String
  firstName_lt: String
  firstName_lte: String
  firstName_re: [RegExp!]
  firstName_exists: Boolean
  code: String
  code_in: [String!]
  code_nin: [String!]
  code_ne: String
  code_gt: String
  code_gte: String
  code_lt: String
  code_lte: String
  code_re: [RegExp!]
  code_exists: Boolean
  AND: [ExampleWherePayloadInput!]
  NOR: [ExampleWherePayloadInput!]
  OR: [ExampleWherePayloadInput!]
}`,
        {},
      ];

      const result = createEntityWherePayloadInputType(entityConfig);
      expect(result).toEqual(expectedResult);
    });
  });
});
