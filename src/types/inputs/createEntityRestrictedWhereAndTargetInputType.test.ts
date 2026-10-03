import type { EntityConfig } from '../../tsTypes';

import createEntityRestrictedWhereAndTargetInputType from './createEntityRestrictedWhereAndTargetInputType';
import createEntityRestrictedWhereInputType from './createEntityRestrictedWhereInputType';
import createEntityTextNamesEnumType from './createEntityTextNamesEnumType';

describe('createEntityRestrictedWhereAndTargetInputType', () => {
  test('should create empty string if there are not any targets', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [{ name: 'title', type: 'textFields' }],
    };
    const expectedResult = ['ExampleRestrictedWhereAndTargetInput', '', {}];

    const result = createEntityRestrictedWhereAndTargetInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create input with target and restricted where', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [{ name: 'title', index: true, type: 'textFields' }],
    };
    const expectedResult = [
      'ExampleRestrictedWhereAndTargetInput',
      `input ExampleRestrictedWhereAndTargetInput {
  target: ExampleTextNamesEnum!
  where: ExampleRestrictedWhereInput
}`,
      {
        ExampleTextNamesEnum: [createEntityTextNamesEnumType, entityConfig],
        ExampleRestrictedWhereInput: [createEntityRestrictedWhereInputType, entityConfig],
      },
    ];

    const result = createEntityRestrictedWhereAndTargetInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
