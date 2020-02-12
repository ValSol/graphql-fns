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
      ],
    };
    const expectedResult = '';

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
    const expectedResult = `input ExampleWhereInput {
  firstName: String
  lastName: String
}`;

    const result = createThingWhereInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type if there are file index fields', () => {
    const thingConfig = {
      name: 'Example',
      fileFields: [
        {
          name: 'firstName',
          generalName: 'generalFile',
          fileType: 'fileType',
          index: true,
        },
        {
          name: 'lastName',
          generalName: 'generalFile',
          fileType: 'fileType',
          index: true,
        },
      ],
    };
    const expectedResult = `input ExampleWhereInput {
  firstName: String
  lastName: String
}`;

    const result = createThingWhereInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type if there are relational index fields', () => {
    const personConfig: ThingConfig = {};
    Object.assign(personConfig, {
      name: 'Person',
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
    const expectedResult = `input PersonWhereInput {
  spouse: ID
  friends: ID
}`;

    const result = createThingWhereInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type if there are relational index fields', () => {
    const personConfig: ThingConfig = {};
    Object.assign(personConfig, {
      name: 'Person',
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
    const expectedResult = `input PersonWhereInput {
  spouse: ID
  friends: ID
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
    const expectedResult = `input ExampleWhereInput {
  field1: WeekdaysEnumeration
  field4: CuisinesEnumeration
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
    const expectedResult = `input ExampleWhereInput {
  firstName: Int
  lastName: Int
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
    const expectedResult = `input ExampleWhereInput {
  firstName: Float
  lastName: Float
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
    const expectedResult = `input ExampleWhereInput {
  firstName: Boolean
  lastName: Boolean
}`;

    const result = createThingWhereInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
