import type { EntityConfig } from '../../tsTypes';

import createEntityCreateInputType from './createEntityCreateInputType';
import createEntityWhereCompoundOneAndCreateDataInputType from './createEntityWhereCompoundOneAndCreateDataInputType';
import createEntityWhereCompoundOneInputType from './createEntityWhereCompoundOneInputType';
import createEntityWhereOneAndCreateDataInputType from './createEntityWhereOneAndCreateDataInputType';
import createEntityWhereOneInputType from './createEntityWhereOneInputType';

describe('createEntityWhereOneAndCreateDataInputType & createEntityWhereCompoundOneAndCreateDataInputType', () => {
  const entityConfig: EntityConfig = {
    name: 'Example',
    type: 'tangible',
    uniqueCompoundIndexes: [['firstName', 'lastName']],
    textFields: [
      { name: 'firstName', type: 'textFields' },
      { name: 'lastName', type: 'textFields' },
    ],
  };

  test('should pair "whereOne" with "data" to create', () => {
    const expectedResult = [
      'ExampleWhereOneAndCreateDataInput',
      `input ExampleWhereOneAndCreateDataInput {
  whereOne: ExampleWhereOneInput!
  data: ExampleCreateInput!
}`,
      {
        ExampleWhereOneInput: [createEntityWhereOneInputType, entityConfig],
        ExampleCreateInput: [createEntityCreateInputType, entityConfig],
      },
    ];

    expect(createEntityWhereOneAndCreateDataInputType(entityConfig)).toEqual(expectedResult);
  });

  test('should pair "whereCompoundOne" with "data" to create', () => {
    const expectedResult = [
      'ExampleWhereCompoundOneAndCreateDataInput',
      `input ExampleWhereCompoundOneAndCreateDataInput {
  whereCompoundOne: ExampleWhereCompoundOneInput!
  data: ExampleCreateInput!
}`,
      {
        ExampleWhereCompoundOneInput: [createEntityWhereCompoundOneInputType, entityConfig],
        ExampleCreateInput: [createEntityCreateInputType, entityConfig],
      },
    ];

    expect(createEntityWhereCompoundOneAndCreateDataInputType(entityConfig)).toEqual(
      expectedResult,
    );
  });

  test('should not create "whereCompoundOne" pair without "uniqueCompoundIndexes"', () => {
    const { uniqueCompoundIndexes, ...entityConfig2 } = entityConfig as any;

    expect(createEntityWhereCompoundOneAndCreateDataInputType(entityConfig2)).toEqual([
      'ExampleWhereCompoundOneAndCreateDataInput',
      '',
      {},
    ]);
  });
});
