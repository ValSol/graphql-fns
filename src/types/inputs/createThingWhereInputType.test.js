// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import createThingWhereInputType from './createThingWhereInputType';

describe('createThingWhereInputType', () => {
  test('should create empty string if there are not any index fields', () => {
    const thingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'firstName',
        },
        {
          name: 'lastName',
        },
        {
          name: 'code',
          unique: true,
        },
      ],
    };
    const expectedResult = `input ExampleWhereWithoutBooleanOperationsInput {
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
  code_in: [String!]
  code_nin: [String!]
  code_ne: String
  code_re: [RegExp!]
}
input ExampleWhereInput {
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
  code_in: [String!]
  code_nin: [String!]
  code_ne: String
  code_re: [RegExp!]
  AND: [ExampleWhereInput!]
  NOR: [ExampleWhereInput!]
  OR: [ExampleWhereInput!]
}`;

    const result = createThingWhereInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type if there are text index fields', () => {
    const thingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'firstName',
          index: true,
        },
        {
          name: 'lastName',
          index: true,
        },
      ],
    };
    const expectedResult = `input ExampleWhereWithoutBooleanOperationsInput {
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
  firstName_re: [RegExp!]
  lastName: String
  lastName_in: [String!]
  lastName_nin: [String!]
  lastName_ne: String
  lastName_re: [RegExp!]
}
input ExampleWhereInput {
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
  firstName_re: [RegExp!]
  lastName: String
  lastName_in: [String!]
  lastName_nin: [String!]
  lastName_ne: String
  lastName_re: [RegExp!]
  AND: [ExampleWhereInput!]
  NOR: [ExampleWhereInput!]
  OR: [ExampleWhereInput!]
}`;

    const result = createThingWhereInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type if there are relational index fields', () => {
    const personConfig: ThingConfig = {};
    Object.assign(personConfig, {
      name: 'Person',
      textFields: [
        {
          name: 'firstName',
          index: true,
        },
        {
          name: 'lastName',
          index: true,
        },
      ],

      relationalFields: [
        {
          name: 'spouse',
          config: personConfig,
          index: true,
        },
        {
          name: 'friends',
          config: personConfig,
          index: true,
          array: true,
        },
      ],
    });
    const expectedResult = `input PersonWhereWithoutBooleanOperationsInput {
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
  firstName_re: [RegExp!]
  lastName: String
  lastName_in: [String!]
  lastName_nin: [String!]
  lastName_ne: String
  lastName_re: [RegExp!]
  spouse: ID
  spouse_in: [ID!]
  spouse_nin: [ID!]
  spouse_ne: ID
  spouse_: PersonWhereWithoutBooleanOperationsInput
  friends: ID
  friends_in: [ID!]
  friends_nin: [ID!]
  friends_ne: ID
  friends_: PersonWhereWithoutBooleanOperationsInput
}
input PersonWhereInput {
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
  firstName_re: [RegExp!]
  lastName: String
  lastName_in: [String!]
  lastName_nin: [String!]
  lastName_ne: String
  lastName_re: [RegExp!]
  spouse: ID
  spouse_in: [ID!]
  spouse_nin: [ID!]
  spouse_ne: ID
  spouse_: PersonWhereWithoutBooleanOperationsInput
  friends: ID
  friends_in: [ID!]
  friends_nin: [ID!]
  friends_ne: ID
  friends_: PersonWhereWithoutBooleanOperationsInput
  AND: [PersonWhereInput!]
  NOR: [PersonWhereInput!]
  OR: [PersonWhereInput!]
}`;

    const result = createThingWhereInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type if there are duplex index fields', () => {
    const personConfig: ThingConfig = {};
    Object.assign(personConfig, {
      name: 'Person',
      textFields: [
        {
          name: 'firstName',
          index: true,
        },
        {
          name: 'lastName',
          index: true,
        },
      ],

      duplexFields: [
        {
          name: 'spouse',
          config: personConfig,
          index: true,
          oppositeName: 'spouse',
        },
        {
          name: 'friends',
          config: personConfig,
          index: true,
          array: true,
          oppositeName: 'friends',
        },
      ],
    });
    const expectedResult = `input PersonWhereWithoutBooleanOperationsInput {
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
  firstName_re: [RegExp!]
  lastName: String
  lastName_in: [String!]
  lastName_nin: [String!]
  lastName_ne: String
  lastName_re: [RegExp!]
  spouse: ID
  spouse_in: [ID!]
  spouse_nin: [ID!]
  spouse_ne: ID
  spouse_: PersonWhereWithoutBooleanOperationsInput
  friends: ID
  friends_in: [ID!]
  friends_nin: [ID!]
  friends_ne: ID
  friends_: PersonWhereWithoutBooleanOperationsInput
}
input PersonWhereInput {
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
  firstName_re: [RegExp!]
  lastName: String
  lastName_in: [String!]
  lastName_nin: [String!]
  lastName_ne: String
  lastName_re: [RegExp!]
  spouse: ID
  spouse_in: [ID!]
  spouse_nin: [ID!]
  spouse_ne: ID
  spouse_: PersonWhereWithoutBooleanOperationsInput
  friends: ID
  friends_in: [ID!]
  friends_nin: [ID!]
  friends_ne: ID
  friends_: PersonWhereWithoutBooleanOperationsInput
  AND: [PersonWhereInput!]
  NOR: [PersonWhereInput!]
  OR: [PersonWhereInput!]
}`;

    const result = createThingWhereInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type if there are enum index fields', () => {
    const thingConfig = {
      name: 'Example',
      enumFields: [
        {
          name: 'field1',
          enumName: 'Weekdays',
          index: true,
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
          index: true,
        },
      ],
    };
    const expectedResult = `input ExampleWhereWithoutBooleanOperationsInput {
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
  field4: CuisinesEnumeration
  field4_in: [CuisinesEnumeration!]
  field4_nin: [CuisinesEnumeration!]
  field4_ne: CuisinesEnumeration
  field4_re: [RegExp!]
}
input ExampleWhereInput {
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
  field4: CuisinesEnumeration
  field4_in: [CuisinesEnumeration!]
  field4_nin: [CuisinesEnumeration!]
  field4_ne: CuisinesEnumeration
  field4_re: [RegExp!]
  AND: [ExampleWhereInput!]
  NOR: [ExampleWhereInput!]
  OR: [ExampleWhereInput!]
}`;

    const result = createThingWhereInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type if there are int index fields', () => {
    const thingConfig = {
      name: 'Example',
      intFields: [
        {
          name: 'firstName',
          index: true,
        },
        {
          name: 'lastName',
          index: true,
        },
      ],
    };
    const expectedResult = `input ExampleWhereWithoutBooleanOperationsInput {
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
  lastName: Int
  lastName_in: [Int!]
  lastName_nin: [Int!]
  lastName_ne: Int
  lastName_gt: Int
  lastName_gte: Int
  lastName_lt: Int
  lastName_lte: Int
}
input ExampleWhereInput {
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
  lastName: Int
  lastName_in: [Int!]
  lastName_nin: [Int!]
  lastName_ne: Int
  lastName_gt: Int
  lastName_gte: Int
  lastName_lt: Int
  lastName_lte: Int
  AND: [ExampleWhereInput!]
  NOR: [ExampleWhereInput!]
  OR: [ExampleWhereInput!]
}`;

    const result = createThingWhereInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type if there are int float fields', () => {
    const thingConfig = {
      name: 'Example',
      floatFields: [
        {
          name: 'firstName',
          index: true,
        },
        {
          name: 'lastName',
          index: true,
        },
      ],
    };
    const expectedResult = `input ExampleWhereWithoutBooleanOperationsInput {
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
  lastName: Float
  lastName_in: [Float!]
  lastName_nin: [Float!]
  lastName_ne: Float
  lastName_gt: Float
  lastName_gte: Float
  lastName_lt: Float
  lastName_lte: Float
}
input ExampleWhereInput {
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
  lastName: Float
  lastName_in: [Float!]
  lastName_nin: [Float!]
  lastName_ne: Float
  lastName_gt: Float
  lastName_gte: Float
  lastName_lt: Float
  lastName_lte: Float
  AND: [ExampleWhereInput!]
  NOR: [ExampleWhereInput!]
  OR: [ExampleWhereInput!]
}`;

    const result = createThingWhereInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type if there are int dateTime fields', () => {
    const thingConfig = {
      name: 'Example',
      dateTimeFields: [
        {
          name: 'firstName',
          index: true,
        },
        {
          name: 'lastName',
          index: true,
        },
      ],
    };
    const expectedResult = `input ExampleWhereWithoutBooleanOperationsInput {
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
  lastName: DateTime
  lastName_in: [DateTime!]
  lastName_nin: [DateTime!]
  lastName_ne: DateTime
  lastName_gt: DateTime
  lastName_gte: DateTime
  lastName_lt: DateTime
  lastName_lte: DateTime
}
input ExampleWhereInput {
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
  lastName: DateTime
  lastName_in: [DateTime!]
  lastName_nin: [DateTime!]
  lastName_ne: DateTime
  lastName_gt: DateTime
  lastName_gte: DateTime
  lastName_lt: DateTime
  lastName_lte: DateTime
  AND: [ExampleWhereInput!]
  NOR: [ExampleWhereInput!]
  OR: [ExampleWhereInput!]
}`;

    const result = createThingWhereInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type if there are boolean float fields', () => {
    const thingConfig = {
      name: 'Example',
      booleanFields: [
        {
          name: 'firstName',
          index: true,
        },
        {
          name: 'lastName',
          index: true,
        },
      ],
    };
    const expectedResult = `input ExampleWhereWithoutBooleanOperationsInput {
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
  lastName: Boolean
}
input ExampleWhereInput {
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
  lastName: Boolean
  AND: [ExampleWhereInput!]
  NOR: [ExampleWhereInput!]
  OR: [ExampleWhereInput!]
}`;

    const result = createThingWhereInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return inputType with counter field', () => {
    const thingConfig = {
      name: 'Example',
      counter: true,
      textFields: [
        {
          name: 'firstName',
        },
      ],
    };
    const expectedResult = `input ExampleWhereWithoutBooleanOperationsInput {
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
}
input ExampleWhereInput {
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
  AND: [ExampleWhereInput!]
  NOR: [ExampleWhereInput!]
  OR: [ExampleWhereInput!]
}`;

    const result = createThingWhereInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
