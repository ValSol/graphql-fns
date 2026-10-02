import type { EntityConfig } from '../../tsTypes';

import createEntityWhereAndSearchInputType from './createEntityWhereAndSearchInputType';
import createEntityWhereInputType from './createEntityWhereInputType';

describe('createEntityWhereAndSearchInputType', () => {
  test('should create input with only "where" if there are no text fields with weight', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [{ name: 'textField', index: true, type: 'textFields' }],
    };

    const expectedResult = [
      'ExampleWhereAndSearchInput',
      `input ExampleWhereAndSearchInput {
  where: ExampleWhereInput = {}
}`,
      { ExampleWhereInput: [createEntityWhereInputType, entityConfig] },
    ];

    const result = createEntityWhereAndSearchInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create input with "where" and "search" if there is text field with weight', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [{ name: 'textField', weight: 1, type: 'textFields' }],
    };

    const expectedResult = [
      'ExampleWhereAndSearchInput',
      `input ExampleWhereAndSearchInput {
  where: ExampleWhereInput = {}
  search: String
}`,
      { ExampleWhereInput: [createEntityWhereInputType, entityConfig] },
    ];

    const result = createEntityWhereAndSearchInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
