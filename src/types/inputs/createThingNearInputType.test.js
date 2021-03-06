// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import createThingNearInputType from './createThingNearInputType';

describe('createThingNearInputType', () => {
  test('should create empty string if there are not any geospatial fields', () => {
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
    const expectedResult = ['ExampleNearInput', '', {}];

    const result = createThingNearInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create thing input type if there are geospatial fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      geospatialFields: [
        {
          name: 'position',
          geospatialType: 'Point',
        },
        {
          name: 'positions',
          array: true,
          geospatialType: 'Point',
        },
        {
          name: 'area',
          geospatialType: 'Polygon',
        },
      ],
    };
    const expectedResult = [
      'ExampleNearInput',
      `enum ExampleGeospatialFieldNamesEnum {
  position
}
input ExampleNearInput {
  geospatialField: ExampleGeospatialFieldNamesEnum
  coordinates: GeospatialPointInput
  maxDistance: Float
}`,
      {},
    ];

    const result = createThingNearInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
