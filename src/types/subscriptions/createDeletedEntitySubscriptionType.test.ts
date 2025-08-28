/* eslint-env jest */
import type { EntityConfig } from '@/tsTypes';

import createDeletedEntitySubscriptionType from './createDeletedEntitySubscriptionType';

describe('createDeletedEntitySubscriptionType', () => {
  test('should create subscription type without index fields', () => {
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
    const expectedResult = '  deletedExample(where: ExampleWhereInput): Example!';

    const result = createDeletedEntitySubscriptionType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create subscription type with where arg', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
          index: true,
          type: 'textFields',
        },
        {
          name: 'lastName',
          index: true,
          type: 'textFields',
        },
      ],
    };
    const expectedResult = '  deletedExample(where: ExampleWhereInput): Example!';

    const result = createDeletedEntitySubscriptionType(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
