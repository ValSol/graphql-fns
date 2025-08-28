/* eslint-env jest */
import type { EntityConfig } from '@/tsTypes';

import createUpdatedEntityPayloadType from './createUpdatedEntityPayloadType';

describe('createUpdatedEntityPayloadType', () => {
  test('should create subscription payload type with text fields', () => {
    const entityConfig: EntityConfig = {
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
      ],
    };

    const expectedResult = `enum ExampleFieldNamesEnum {
  firstName
  lastName
}
type UpdatedExamplePayload {
  node: Example
  previousNode: Example
  updatedFields: [ExampleFieldNamesEnum!]
}`;

    const result = createUpdatedEntityPayloadType(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
