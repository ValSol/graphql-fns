import composeGeospatialKey from '.';

describe('composeGeospatialKey', () => {
  test('should return the nested "coordinates" path for "Point"', () => {
    expect(composeGeospatialKey('position', 'Point')).toBe('position.coordinates');
    expect(composeGeospatialKey('shop_.embedded.position', 'Point')).toBe(
      'shop_.embedded.position.coordinates',
    );
  });

  test('should return the path as is for other geospatial types', () => {
    ['LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'].forEach((geospatialType) => {
      expect(composeGeospatialKey('area', geospatialType as 'Polygon')).toBe('area');
    });
  });
});
