// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

const createThingSubscriptionPayloadType = require('./createThingSubscriptionPayloadType');

describe('createThingSubscriptionPayloadType', () => {
  test('should create subscription payload type with text fields', () => {
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

    const expectedResult = `enum ExampleFieldNamesEnumeration {
  firstName
  lastName
}
type ExampleSubscriptionPayload {
  node: Example
  previousNode: Example
  updatedFields: [ExampleFieldNamesEnumeration!]
}`;

    const result = createThingSubscriptionPayloadType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create subscription payload type with text fields', () => {
    const exampleConfig: ThingConfig = {};
    const embeddedConfig: ThingConfig = {
      name: 'Embedded',
      embedded: true,
      textFields: [
        {
          name: 'name',
        },
      ],
    };
    Object.assign(exampleConfig, {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
      intFields: [
        {
          name: 'intField',
        },
      ],
      floatFields: [
        {
          name: 'floatField',
        },
      ],
      dateTimeFields: [
        {
          name: 'dateTimeField',
        },
      ],
      booleanFields: [
        {
          name: 'booleanField',
        },
      ],
      duplexFields: [
        {
          name: 'duplexField',
          config: exampleConfig,
          oppositeName: 'duplexField',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedField',
          config: embeddedConfig,
        },
      ],
      enumFields: [
        {
          name: 'enumField',
          enumName: 'Enums',
        },
      ],
      geospatialFields: [
        {
          name: 'geospatialField',
          type: 'Point',
        },
      ],
      relationalFields: [
        {
          name: 'relationalField',
          config: exampleConfig,
        },
      ],
    });

    const expectedResult = `enum ExampleFieldNamesEnumeration {
  textField
  intField
  floatField
  dateTimeField
  booleanField
  duplexField
  embeddedField
  enumField
  geospatialField
  relationalField
}
type ExampleSubscriptionPayload {
  node: Example
  previousNode: Example
  updatedFields: [ExampleFieldNamesEnumeration!]
}`;

    const result = createThingSubscriptionPayloadType(exampleConfig);
    expect(result).toEqual(expectedResult);
  });
});
