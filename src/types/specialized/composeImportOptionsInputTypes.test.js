// @flow
/* eslint-env jest */
import type { GeneralConfig, Inventory, ThingConfig } from '../../flowTypes';

import composeImportOptionsInputTypes from './composeImportOptionsInputTypes';

describe('composeImportOptionsInputTypes', () => {
  test('should return empty string if createThing mutation is excluded', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
    };
    const thingConfigs = [thingConfig];
    const inventory: Inventory = {
      exclude: {
        Mutation: {
          createThing: ['Example'],
        },
      },
    };
    const generalConfig: GeneralConfig = { thingConfigs, inventory };
    const expectedResult = '';

    const result = composeImportOptionsInputTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return empty string if importThings mutation is excluded', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
    };
    const thingConfigs = [thingConfig];
    const inventory: Inventory = {
      exclude: {
        Mutation: {
          importThings: null,
        },
      },
    };
    const generalConfig: GeneralConfig = { thingConfigs, inventory };
    const expectedResult = '';

    const result = composeImportOptionsInputTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return empty string if importThings mutation is excluded', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
    };
    const thingConfigs = [thingConfig];
    const inventory: Inventory = {
      exclude: {
        Mutation: {
          importThings: null,
        },
      },
    };
    const generalConfig: GeneralConfig = { thingConfigs, inventory };
    const expectedResult = '';

    const result = composeImportOptionsInputTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return ImportOptionsInput type', () => {
    const thingConfig: ThingConfig = {
      name: 'Place',
      geospatialFields: [
        {
          name: 'position',
          geospatialType: 'Point',
        },
      ],
    };
    const thingConfigs = [thingConfig];
    const generalConfig: GeneralConfig = { thingConfigs };
    const expectedResult = `enum ImportFormatEnum {
  csv
  json
}
input ImportOptionsInput {
  format: ImportFormatEnum
}`;

    const result = composeImportOptionsInputTypes(generalConfig);
    expect(result).toEqual(expectedResult);
  });
});
