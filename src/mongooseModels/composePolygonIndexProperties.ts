import type { EntityConfig } from '../tsTypes';

const composePolygonIndexProperties = (entityConfig: EntityConfig) => {
  const { geospatialFields = [] } = entityConfig;

  return geospatialFields.reduce((prev: string[], { name, index, geospatialType }) => {
    if (index && (geospatialType === 'Polygon' || geospatialType === 'MultiPolygon')) {
      prev.push(name);
    }

    return prev;
  }, []);
};

export default composePolygonIndexProperties;
