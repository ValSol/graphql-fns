// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

const createDeletedThingSubscriptionType = require('./createDeletedThingSubscriptionType');

describe('createDeletedThingSubscriptionType', () => {
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
    const expectedResult = '  deletedExample(whereOne: ExampleWhereOneInput): Example!';

    const result = createDeletedThingSubscriptionType(thingConfig);
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
      '  deletedExample(whereOne: ExampleWhereOneInput, where: ExampleWhereInput): Example!';

    const result = createDeletedThingSubscriptionType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
