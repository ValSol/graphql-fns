// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import processUpdateInputData from './processUpdateInputData';

describe('processUpdateInputData', () => {
  test('should create object with simple fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Thing',
      textFields: [
        {
          name: 'textField1',
        },
        {
          name: 'textField2',
        },
      ],
    };
    const data = {
      textField1: 'textField1-Value',
      textField2: 'textField2-Value',
    };

    const expectedResult = {
      textField1: 'textField1-Value',
      textField2: 'textField2-Value',
    };
    const result = processUpdateInputData(data, thingConfig);

    expect(result).toEqual(expectedResult);
  });

  test('should create object with geospatial fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Thing',
      geospatialFields: [
        {
          name: 'point',
          geospatialType: 'Point',
        },
        {
          name: 'points',
          array: true,
          geospatialType: 'Point',
        },
        {
          name: 'polygon',
          geospatialType: 'Polygon',
        },
        {
          name: 'polygons',
          array: true,
          geospatialType: 'Polygon',
        },
      ],
    };
    const data = {
      point: { lng: 40, lat: 5 },
      points: [{ lng: 12, lat: 23 }, { lng: 34, lat: 45 }],
      polygon: {
        externalRing: {
          ring: [{ lng: 0, lat: 0 }, { lng: 3, lat: 6 }, { lng: 6, lat: 1 }, { lng: 0, lat: 0 }],
        },
      },
      polygons: [
        {
          externalRing: {
            ring: [{ lng: 0, lat: 0 }, { lng: 3, lat: 6 }, { lng: 6, lat: 1 }, { lng: 0, lat: 0 }],
          },
        },
      ],
    };

    const expectedResult = {
      point: { type: 'Point', coordinates: [40, 5] },
      points: [{ type: 'Point', coordinates: [12, 23] }, { type: 'Point', coordinates: [34, 45] }],
      polygon: {
        type: 'Polygon',
        coordinates: [[[0, 0], [3, 6], [6, 1], [0, 0]]],
      },
      polygons: [
        {
          type: 'Polygon',
          coordinates: [[[0, 0], [3, 6], [6, 1], [0, 0]]],
        },
      ],
    };
    const result = processUpdateInputData(data, thingConfig);

    expect(result).toEqual(expectedResult);
  });
});
