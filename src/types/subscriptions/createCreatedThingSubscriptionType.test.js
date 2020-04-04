// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import createCreatedThingSubscriptionType from './createCreatedThingSubscriptionType';

describe('createCreatedThingSubscriptionType', () => {
  test('should create subscription type without index fields', () => {
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
    const expectedResult = '  createdExample(where: ExampleWhereInput): Example!';

    const result = createCreatedThingSubscriptionType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create subscription type with where arg', () => {
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
    const expectedResult = '  createdExample(where: ExampleWhereInput): Example!';

    const result = createCreatedThingSubscriptionType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
