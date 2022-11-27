// @flow
/* eslint-env jest */
import type { EntityConfig } from '../../flowTypes';

import createUpdatedEntitySubscriptionType from './createUpdatedEntitySubscriptionType';

describe('createUpdatedEntitySubscriptionType', () => {
  test('should create subscription type without index fields', () => {
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
    const expectedResult = '  updatedExample(where: ExampleWhereInput): UpdatedExamplePayload!';

    const result = createUpdatedEntitySubscriptionType(entityConfig);
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
        },
        {
          name: 'lastName',
          index: true,
        },
      ],
    };
    const expectedResult = '  updatedExample(where: ExampleWhereInput): UpdatedExamplePayload!';

    const result = createUpdatedEntitySubscriptionType(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
