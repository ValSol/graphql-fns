// @flow
/* eslint-env jest */
import type { GeneralConfig, ThingConfig } from '../../flowTypes';

const composeSubscriptionMutationEnumerations = require('./composeSubscriptionMutationEnumerations');

describe('composeSubscriptionMutationEnumerations', () => {
  test('should return standard set of subscription mutation enums', () => {
    const pesontConfig: ThingConfig = { name: 'Person' };
    const placeConfig: ThingConfig = { name: 'Place' };
    const generalConfig: GeneralConfig = {
      thingConfigs: [pesontConfig, placeConfig],
    };
    const expectedResult = `enum PersonSubscriptionMutationEnumeration {
  CREATED
  UPDATED
  DELETED
}
enum PlaceSubscriptionMutationEnumeration {
  CREATED
  UPDATED
  DELETED
}`;

    const result = composeSubscriptionMutationEnumerations(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return empty string of subscription mutation enums', () => {
    const pesontConfig: ThingConfig = { name: 'Person' };
    const placeConfig: ThingConfig = { name: 'Place' };
    const generalConfig: GeneralConfig = {
      thingConfigs: [pesontConfig, placeConfig],
      inventory: { exclude: { Mutation: null } },
    };
    const expectedResult = '';

    const result = composeSubscriptionMutationEnumerations(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return empty string of subscription mutation enums 2', () => {
    const pesontConfig: ThingConfig = { name: 'Person' };
    const placeConfig: ThingConfig = { name: 'Place' };
    const generalConfig: GeneralConfig = {
      thingConfigs: [pesontConfig, placeConfig],
      inventory: { exclude: { Subscription: null } },
    };
    const expectedResult = '';

    const result = composeSubscriptionMutationEnumerations(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return subscription mutation enums without thing create mutations', () => {
    const pesontConfig: ThingConfig = { name: 'Person' };
    const placeConfig: ThingConfig = { name: 'Place' };
    const generalConfig: GeneralConfig = {
      thingConfigs: [pesontConfig, placeConfig],
      inventory: { exclude: { Mutation: { createThing: null } } },
    };
    const expectedResult = `enum PersonSubscriptionMutationEnumeration {
  UPDATED
  DELETED
}
enum PlaceSubscriptionMutationEnumeration {
  UPDATED
  DELETED
}`;

    const result = composeSubscriptionMutationEnumerations(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return subscription mutation enums without thing create mutations', () => {
    const pesontConfig: ThingConfig = { name: 'Person' };
    const placeConfig: ThingConfig = { name: 'Place' };
    const generalConfig: GeneralConfig = {
      thingConfigs: [pesontConfig, placeConfig],
      inventory: { exclude: { Mutation: { createThing: ['Place'] } } },
    };
    const expectedResult = `enum PersonSubscriptionMutationEnumeration {
  CREATED
  UPDATED
  DELETED
}
enum PlaceSubscriptionMutationEnumeration {
  UPDATED
  DELETED
}`;

    const result = composeSubscriptionMutationEnumerations(generalConfig);
    expect(result).toEqual(expectedResult);
  });
});
