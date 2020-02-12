// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import createDeletedThingSubscriptionType from './createDeletedThingSubscriptionType';

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
    const expectedResult = '  deletedExample: Example!';

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
    const expectedResult = '  deletedExample(where: ExampleWhereInput): Example!';

    const result = createDeletedThingSubscriptionType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create subscription type without index fields 2', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      fileFields: [
        {
          name: 'firstName',
          generalName: 'generalFile',
          fileType: 'fileType',
        },
        {
          name: 'lastName',
          generalName: 'generalFile',
          fileType: 'fileType',
        },
      ],
    };
    const expectedResult = '  deletedExample: Example!';

    const result = createDeletedThingSubscriptionType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create subscription type with where arg 2', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      fileFields: [
        {
          name: 'firstName',
          generalName: 'generalFile',
          fileType: 'fileType',
          index: true,
        },
        {
          name: 'lastName',
          generalName: 'generalFile',
          fileType: 'fileType',
          index: true,
        },
      ],
    };
    const expectedResult = '  deletedExample(where: ExampleWhereInput): Example!';

    const result = createDeletedThingSubscriptionType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
