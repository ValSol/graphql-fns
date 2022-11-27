// @flow
/* eslint-env jest */
import type { EntityConfig } from '../../flowTypes';

import createCreatedEntitySubscriptionType from './createCreatedEntitySubscriptionType';

describe('createCreatedEntitySubscriptionType', () => {
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
    const expectedResult = '  createdExample(where: ExampleWhereInput): Example!';

    const result = createCreatedEntitySubscriptionType(entityConfig);
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
    const expectedResult = '  createdExample(where: ExampleWhereInput): Example!';

    const result = createCreatedEntitySubscriptionType(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
