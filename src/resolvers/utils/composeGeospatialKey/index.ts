import type { GeospatialField } from '@/tsTypes';

// the "2dsphere" index of a "Point" field is built on its nested "coordinates" array
// so "$geoNear", "$nearSphere" & "$geoWithin" have to use the same path to use the index
const composeGeospatialKey = (path: string, geospatialType: GeospatialField['geospatialType']) =>
  geospatialType === 'Point' ? `${path}.coordinates` : path;

export default composeGeospatialKey;
