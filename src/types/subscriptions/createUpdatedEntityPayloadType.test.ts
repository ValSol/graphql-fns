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
          type: 'textFields',
        },
        {
          name: 'lastName',
          type: 'textFields',
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
          type: 'textFields',
        },
      ],
    };

    const imageConfig: EntityConfig = {
      name: 'Image',
      type: 'file',
      textFields: [
        {
          name: 'fileId',
          type: 'textFields',
        },
        {
          name: 'address',
          type: 'textFields',
        },
      ],
    };

    Object.assign(exampleConfig, {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
      ],
      intFields: [
        {
          name: 'intField',
          type: 'intFields',
        },
      ],
      floatFields: [
        {
          name: 'floatField',
          type: 'floatFields',
        },
      ],
      dateTimeFields: [
        {
          name: 'dateTimeField',
          type: 'dateTimeFields',
        },
      ],
      booleanFields: [
        {
          name: 'booleanField',
          type: 'booleanFields',
        },
      ],
      duplexFields: [
        {
          name: 'duplexField',
          config: exampleConfig,
          oppositeName: 'duplexField',
          type: 'duplexFields',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedField',
          config: embeddedConfig,
          type: 'embeddedFields',
        },
      ],
      enumFields: [
        {
          name: 'enumField',
          enumName: 'Enums',
          type: 'enumFields',
        },
      ],
      geospatialFields: [
        {
          name: 'geospatialField',
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
      ],
      relationalFields: [
        {
          name: 'relationalField',
          config: exampleConfig,
          type: 'relationalFields',
        },
      ],
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
          type: 'fileFields',
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
