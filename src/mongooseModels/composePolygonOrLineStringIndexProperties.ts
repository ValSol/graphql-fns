import type { EntityConfig } from '../tsTypes';

const composePolygonOrLineStringIndexProperties = (entityConfig: EntityConfig) => {
  const { geospatialFields = [] } = entityConfig;

  return geospatialFields.reduce((prev: string[], { name, index, geospatialType }) => {
    if (
      index &&
      (geospatialType === 'LineString' ||
        geospatialType === 'MultiLineString' ||
        geospatialType === 'Polygon' ||
        geospatialType === 'MultiPolygon')
    ) {
      prev.push(name);
    }

    return prev;
  }, []);
};

export default composePolygonOrLineStringIndexProperties;
