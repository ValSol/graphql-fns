import type { EmbeddedField, EntityConfig, FileField, GeospatialField } from '../tsTypes';

import composeFieldsObject from './composeFieldsObject';

const composeEmptyValues = (entityConfig: EntityConfig): any => {
  const fieldsObject = composeFieldsObject(entityConfig);

  const result = Object.keys(fieldsObject).reduce<Record<string, any>>((prev, name) => {
    const { array, type: fieldType } = fieldsObject[name];

    if (array) {
      prev[name] = []; // eslint-disable-line no-param-reassign
    } else if (
      fieldsObject[name].type === 'embeddedFields' ||
      fieldsObject[name].type === 'fileFields'
    ) {
      const { config } = fieldsObject[name] as EmbeddedField | FileField;
      prev[name] = composeEmptyValues(config); // eslint-disable-line no-param-reassign
    } else if (fieldType === 'booleanFields') {
      prev[name] = false; // eslint-disable-line no-param-reassign
    } else if (fieldsObject[name].type === 'geospatialFields') {
      const { geospatialType } = fieldsObject[name] as GeospatialField;
      if (geospatialType === 'Point') {
        prev[name] = { lng: '', lat: '' }; // eslint-disable-line no-param-reassign
      } else if (geospatialType === 'Polygon') {
        // eslint-disable-next-line no-param-reassign
        prev[name] = {
          externalRing: {
            ring: [],
          },
          internalRings: [],
        };
      } else {
        throw new TypeError(`Invalid geospatialType: "${geospatialType}" of field "${name}"!`);
      }
    } else {
      prev[name] = ''; // eslint-disable-line no-param-reassign
    }

    return prev;
  }, {});

  return result;
};

export default composeEmptyValues;
