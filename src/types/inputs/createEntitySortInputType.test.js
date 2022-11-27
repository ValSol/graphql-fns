// @flow
/* eslint-env jest */
import type { EntityConfig } from '../../flowTypes';

import createEntitySortInputType from './createEntitySortInputType';

describe('createEntitySortInputType', () => {
  test('should create empty string if there are not any indexed fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
        },
        {
          name: 'lastName',
        },
      ],
    };
    const expectedResult = [
      'ExampleSortInput',
      `enum ExampleSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}
input ExampleSortInput {
  sortBy: [ExampleSortEnum]
}`,
      {},
    ];

    const result = createEntitySortInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create string with indexed text fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
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
    const expectedResult = [
      'ExampleSortInput',
      `enum ExampleSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
  firstName_ASC
  firstName_DESC
  lastName_ASC
  lastName_DESC
}
input ExampleSortInput {
  sortBy: [ExampleSortEnum]
}`,
      {},
    ];

    const result = createEntitySortInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create string with indexed enum fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
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
    const expectedResult = [
      'ExampleSortInput',
      `enum ExampleSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
  firstCuisine_ASC
  firstCuisine_DESC
  secondCuisine_ASC
  secondCuisine_DESC
}
input ExampleSortInput {
  sortBy: [ExampleSortEnum]
}`,
      {},
    ];

    const result = createEntitySortInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create string with indexed int fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
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
    const expectedResult = [
      'ExampleSortInput',
      `enum ExampleSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
  firstName_ASC
  firstName_DESC
  lastName_ASC
  lastName_DESC
}
input ExampleSortInput {
  sortBy: [ExampleSortEnum]
}`,
      {},
    ];

    const result = createEntitySortInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create string with indexed text fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
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
    const expectedResult = [
      'ExampleSortInput',
      `enum ExampleSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
  firstName_ASC
  firstName_DESC
  lastName_ASC
  lastName_DESC
}
input ExampleSortInput {
  sortBy: [ExampleSortEnum]
}`,
      {},
    ];

    const result = createEntitySortInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create string with indexed text fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
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
    const expectedResult = [
      'ExampleSortInput',
      `enum ExampleSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
  firstName_ASC
  firstName_DESC
  lastName_ASC
  lastName_DESC
}
input ExampleSortInput {
  sortBy: [ExampleSortEnum]
}`,
      {},
    ];

    const result = createEntitySortInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create string with indexed datetime fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
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
    const expectedResult = [
      'ExampleSortInput',
      `enum ExampleSortEnum {
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
  firstName_ASC
  firstName_DESC
  lastName_ASC
  lastName_DESC
}
input ExampleSortInput {
  sortBy: [ExampleSortEnum]
}`,
      {},
    ];

    const result = createEntitySortInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
