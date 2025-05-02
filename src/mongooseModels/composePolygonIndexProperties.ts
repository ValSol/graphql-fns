import type { EntityConfig } from '../tsTypes';

const composePolygonIndexProperties = (entityConfig: EntityConfig) => {
  const { geospatialFields = [] } = entityConfig;

  return geospatialFields.reduce((prev: string[], { name, geospatialType }) => {
    if (geospatialType === 'Polygon') {
      prev.push(name);
    }

    return prev;
  }, []);
};

export default composePolygonIndexProperties;
