// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

const createThingSubscriptionType = require('./createThingSubscriptionType');

describe('createThingSubscriptionType', () => {
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
      '  ExampleSubscription(whereOne: ExampleWhereOneInput, mutation_in: [ExampleSubscriptionMutationEnum!]): ExampleSubscriptionPayload';

    const result = createThingSubscriptionType(thingConfig);
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
      '  ExampleSubscription(whereOne: ExampleWhereOneInput, where: ExampleWhereInput, mutation_in: [ExampleSubscriptionMutationEnum!]): ExampleSubscriptionPayload';

    const result = createThingSubscriptionType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
