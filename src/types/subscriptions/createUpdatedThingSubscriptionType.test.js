// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import createUpdatedThingSubscriptionType from './createUpdatedThingSubscriptionType';

describe('createUpdatedThingSubscriptionType', () => {
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
    const expectedResult =
      '  updatedExample(whereOne: ExampleWhereOneInput): UpdatedExamplePayload!';

    const result = createUpdatedThingSubscriptionType(thingConfig);
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
    const expectedResult =
      '  updatedExample(whereOne: ExampleWhereOneInput, where: ExampleWhereInput): UpdatedExamplePayload!';

    const result = createUpdatedThingSubscriptionType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create subscription type without index fields 2', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      fileFields: [
        {
          name: 'firstName',
        },
        {
          name: 'lastName',
        },
      ],
    };
    const expectedResult =
      '  updatedExample(whereOne: ExampleWhereOneInput): UpdatedExamplePayload!';

    const result = createUpdatedThingSubscriptionType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create subscription type with where arg 2', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      fileFields: [
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
    const expectedResult =
      '  updatedExample(whereOne: ExampleWhereOneInput, where: ExampleWhereInput): UpdatedExamplePayload!';

    const result = createUpdatedThingSubscriptionType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
