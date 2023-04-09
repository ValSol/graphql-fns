/* eslint-env jest */
import type { EntityConfig } from '../../tsTypes';

import createEntityNearInputType from './createEntityNearInputType';

describe('createEntityNearInputType', () => {
  test('should create empty string if there are not any geospatial fields', () => {
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
    const expectedResult = ['ExampleNearInput', '', {}];

    const result = createEntityNearInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create entity input type if there are geospatial fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      geospatialFields: [
        {
          name: 'position',
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
        {
          name: 'positions',
          array: true,
          geospatialType: 'Point',
          type: 'geospatialFields',
        },
        {
          name: 'area',
          geospatialType: 'Polygon',
          type: 'geospatialFields',
        },
      ],
    };
    const expectedResult = [
      'ExampleNearInput',
      `enum ExampleGeospatialFieldNamesEnum {
  position
}
input ExampleNearInput {
  geospatialField: ExampleGeospatialFieldNamesEnum!
  coordinates: GeospatialPointInput!
  maxDistance: Float
  minDistance: Float
}`,
      {},
    ];

    const result = createEntityNearInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
