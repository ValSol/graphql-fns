import type { EntityConfig } from '../../tsTypes';

import createEntityUpdateInputType from './createEntityUpdateInputType';
import createEntityWhereCompoundOneAndDataInputType from './createEntityWhereCompoundOneAndDataInputType';
import createEntityWhereCompoundOneInputType from './createEntityWhereCompoundOneInputType';
import createEntityWhereOneAndDataInputType from './createEntityWhereOneAndDataInputType';
import createEntityWhereOneInputType from './createEntityWhereOneInputType';

describe('createEntityWhereOneAndDataInputType & createEntityWhereCompoundOneAndDataInputType', () => {
  const entityConfig: EntityConfig = {
    name: 'Example',
    type: 'tangible',
    uniqueCompoundIndexes: [['firstName', 'lastName']],
    textFields: [
      { name: 'firstName', type: 'textFields' },
      { name: 'lastName', type: 'textFields' },
    ],
  };

  test('should pair "whereOne" with "data"', () => {
    const expectedResult = [
      'ExampleWhereOneAndDataInput',
      `input ExampleWhereOneAndDataInput {
  whereOne: ExampleWhereOneInput!
  data: ExampleUpdateInput!
}`,
      {
        ExampleWhereOneInput: [createEntityWhereOneInputType, entityConfig],
        ExampleUpdateInput: [createEntityUpdateInputType, entityConfig],
      },
    ];

    expect(createEntityWhereOneAndDataInputType(entityConfig)).toEqual(expectedResult);
  });

  test('should pair "whereCompoundOne" with "data"', () => {
    const expectedResult = [
      'ExampleWhereCompoundOneAndDataInput',
      `input ExampleWhereCompoundOneAndDataInput {
  whereCompoundOne: ExampleWhereCompoundOneInput!
  data: ExampleUpdateInput!
}`,
      {
        ExampleWhereCompoundOneInput: [createEntityWhereCompoundOneInputType, entityConfig],
        ExampleUpdateInput: [createEntityUpdateInputType, entityConfig],
      },
    ];

    expect(createEntityWhereCompoundOneAndDataInputType(entityConfig)).toEqual(expectedResult);
  });

  test('should not create "whereCompoundOne" pair without "uniqueCompoundIndexes"', () => {
    const { uniqueCompoundIndexes, ...entityConfig2 } = entityConfig as any;

    expect(createEntityWhereCompoundOneAndDataInputType(entityConfig2)).toEqual([
      'ExampleWhereCompoundOneAndDataInput',
      '',
      {},
    ]);
  });

  test('should not create pairs without fields to update', () => {
    const entityConfig2: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      uniqueCompoundIndexes: [['code']],
      textFields: [{ name: 'code', type: 'textFields', freeze: true }],
    };

    expect(createEntityWhereOneAndDataInputType(entityConfig2)[1]).toBe('');
    expect(createEntityWhereCompoundOneAndDataInputType(entityConfig2)[1]).toBe('');
  });
});
