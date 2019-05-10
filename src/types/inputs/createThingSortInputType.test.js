// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

const createThingSortInputType = require('./createThingSortInputType');

describe('createThingSortInputType', () => {
  test('should create empty string if there are not any indexed fields', () => {
    const thingConfig: ThingConfig = {
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

    const result = createThingSortInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create string with indexed text fields', () => {
    const thingConfig: ThingConfig = {
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
    const expectedResult = `enum ExampleSortEnumeration {
  firstName_ASC
  firstName_DESC
  lastName_ASC
  lastName_DESC
}
input ExampleSortInput {
  sortBy: [ExampleSortEnumeration]
}`;

    const result = createThingSortInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create string with indexed enum fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      enumFields: [
        {
          name: 'firstCuisine',
          index: true,
          enumName: 'Cuisines',
        },
        {
          name: 'secondCuisine',
          index: true,
          enumName: 'Cuisines',
        },
        {
          name: 'otherCuisines',
          array: true,
          index: true,
          enumName: 'Cuisines',
        },
      ],
    };
    const expectedResult = `enum ExampleSortEnumeration {
  firstCuisine_ASC
  firstCuisine_DESC
  secondCuisine_ASC
  secondCuisine_DESC
}
input ExampleSortInput {
  sortBy: [ExampleSortEnumeration]
}`;

    const result = createThingSortInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create string with indexed int fields', () => {
    const thingConfig: ThingConfig = {
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
    const expectedResult = `enum ExampleSortEnumeration {
  firstName_ASC
  firstName_DESC
  lastName_ASC
  lastName_DESC
}
input ExampleSortInput {
  sortBy: [ExampleSortEnumeration]
}`;

    const result = createThingSortInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create string with indexed text fields', () => {
    const thingConfig: ThingConfig = {
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
    const expectedResult = `enum ExampleSortEnumeration {
  firstName_ASC
  firstName_DESC
  lastName_ASC
  lastName_DESC
}
input ExampleSortInput {
  sortBy: [ExampleSortEnumeration]
}`;

    const result = createThingSortInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create string with indexed text fields', () => {
    const thingConfig: ThingConfig = {
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
    const expectedResult = `enum ExampleSortEnumeration {
  firstName_ASC
  firstName_DESC
  lastName_ASC
  lastName_DESC
}
input ExampleSortInput {
  sortBy: [ExampleSortEnumeration]
}`;

    const result = createThingSortInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
