// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

const composeGeospatialTypes = require('./composeGeospatialTypes');

describe('composeGeospatialTypes', () => {
  test('should return empty string if there are not any geospatial fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
    };
    const thingConfigs = [thingConfig];
    const expectedResult = '';

    const result = composeGeospatialTypes(thingConfigs);
    expect(result).toEqual(expectedResult);
  });
  test('should return GeospatialPoint type if there are geospatial fields with type "Point"', () => {
    const thingConfig: ThingConfig = {
      name: 'Place',
      geospatialFields: [
        {
          name: 'position',
          type: 'Point',
        },
      ],
    };
    const thingConfigs = [thingConfig];
    const expectedResult = `
type GeospatialPoint {
  longitude: Float!
  latitude: Float!
}
input GeospatialPointInput {
  longitude: Float!
  latitude: Float!
}`;

    const result = composeGeospatialTypes(thingConfigs);
    expect(result).toEqual(expectedResult);
  });

  test('should return GeospatialPoint, GeospatialPolygonRing and GeospatialPolygon types if there are geospatial fields with type "Polygon"', () => {
    const thingConfig: ThingConfig = {
      name: 'District',
      geospatialFields: [
        {
          name: 'area',
          type: 'Polygon',
        },
      ],
    };
    const thingConfigs = [thingConfig];
    const expectedResult = `
type GeospatialPoint {
  longitude: Float!
  latitude: Float!
}
type GeospatialPolygonRing {
  ring: [GeospatialPoint!]!
}
type GeospatialPolygon {
  extarnalRing: GeospatialPolygonRing!
  intarnalRings: [GeospatialPolygonRing!]
}
input GeospatialPointInput {
  longitude: Float!
  latitude: Float!
}
input GeospatialPolygonRingInput {
  ring: [GeospatialPointInput!]!
}
input GeospatialPolygonInput {
  extarnalRing: GeospatialPolygonRingInput!
  intarnalRings: [GeospatialPolygonRingInput!]
}`;
    const result = composeGeospatialTypes(thingConfigs);
    expect(result).toEqual(expectedResult);
  });
});
