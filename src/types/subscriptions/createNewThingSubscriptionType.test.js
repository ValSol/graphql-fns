// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

const createNewThingSubscriptionType = require('./createNewThingSubscriptionType');

describe('createNewThingSubscriptionType', () => {
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
    const expectedResult = '  newExample: Example!';

    const result = createNewThingSubscriptionType(thingConfig);
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
    const expectedResult = '  newExample(where: ExampleWhereInput): Example!';

    const result = createNewThingSubscriptionType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
