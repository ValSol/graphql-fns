/* eslint-env jest */

import type { EntityConfig } from '../tsTypes';

import composePolygonOrLineStringIndexProperties from './composePolygonOrLineStringIndexProperties';

describe('composePolygonOrLineStringIndexProperties', () => {
  test('should compose schema properties with text fields', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      geospatialFields: [
        {
          name: 'point',
          geospatialType: 'Point',
          index: true,
          type: 'geospatialFields',
        },
        {
          name: 'area',
          geospatialType: 'Polygon',
          index: true,
          type: 'geospatialFields',
        },
      ],
    };

    const expectedResult = ['area'];

    const result = composePolygonOrLineStringIndexProperties(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
