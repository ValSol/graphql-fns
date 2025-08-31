import type { EmbeddedField, EntityConfig, GeospatialField } from '@/tsTypes';

import composeFieldsObject from './composeFieldsObject';

const composeEmptyValues = (entityConfig: EntityConfig): any => {
  const { fieldsObject } = composeFieldsObject(entityConfig);

  const result = Object.keys(fieldsObject).reduce<Record<string, any>>((prev, name) => {
    const { array, type: fieldType } = fieldsObject[name];

    if (array) {
      prev[name] = [];
    } else if (fieldsObject[name].type === 'embeddedFields') {
      const { config } = fieldsObject[name] as EmbeddedField;
      prev[name] = composeEmptyValues(config);
    } else if (fieldType === 'booleanFields') {
      prev[name] = false;
    } else if (fieldsObject[name].type === 'geospatialFields') {
      const { geospatialType } = fieldsObject[name] as GeospatialField;
      if (geospatialType === 'Point') {
        prev[name] = { lng: '', lat: '' };
      } else if (geospatialType === 'Polygon') {
        prev[name] = {
          externalRing: {
            ring: [],
          },
          internalRings: [],
        };
      } else if (geospatialType === 'MultiPolygon') {
        prev[name] = { polygons: [{ externalRing: { ring: [] }, internalRings: [] }] };
      } else {
        throw new TypeError(`Invalid geospatialType: "${geospatialType}" of field "${name}"!`);
      }
    } else {
      prev[name] = '';
    }

    return prev;
  }, {});

  return result;
};

export default composeEmptyValues;
