// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

const createThingWhereInputType = require('./createThingWhereInputType');

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
    const expectedResult = `
input ExampleWhereInput {
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
    const expectedResult = `
input PersonWhereInput {
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
    const expectedResult = `
input PersonWhereInput {
  spouse: ID
  friends: ID
}`;

    const result = createThingWhereInputType(personConfig);
    expect(result).toEqual(expectedResult);
  });
});
