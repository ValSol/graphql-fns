/* eslint-env jest */
import type { EntityConfig } from '../../tsTypes';

import createUpdatedEntityPayloadType from './createUpdatedEntityPayloadType';

describe('createUpdatedEntityPayloadType', () => {
  test('should create subscription payload type with text fields', () => {
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

    const expectedResult = `enum ExampleFieldNamesEnum {
  firstName
  lastName
}
type UpdatedExamplePayload {
  node: Example
  previousNode: Example
  updatedFields: [ExampleFieldNamesEnum!]
}`;

    const result = createUpdatedEntityPayloadType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create subscription payload type with text fields', () => {
    const exampleConfig = {} as EntityConfig;
    const embeddedConfig: EntityConfig = {
      name: 'Embedded',
      type: 'embedded',
      textFields: [
        {
          name: 'name',
        },
      ],
    };

    const imageConfig: EntityConfig = {
      name: 'Image',
      type: 'file',
      textFields: [
        {
          name: 'fileId',
        },
        {
          name: 'address',
        },
      ],
    };

    Object.assign(exampleConfig, {
      name: 'Example',
      type: 'tangible',
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
          geospatialType: 'Point',
        },
      ],
      relationalFields: [
        {
          name: 'relationalField',
          config: exampleConfig,
        },
      ],
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
        },
      ],
    });

    const expectedResult = `enum ExampleFieldNamesEnum {
  textField
  intField
  floatField
  dateTimeField
  booleanField
  embeddedField
  logo
  enumField
  geospatialField
  duplexField
  relationalField
}
type UpdatedExamplePayload {
  node: Example
  previousNode: Example
  updatedFields: [ExampleFieldNamesEnum!]
}`;

    const result = createUpdatedEntityPayloadType(exampleConfig);
    expect(result).toEqual(expectedResult);
  });
});
