// @flow
import type { EntityConfig } from '../flowTypes';

import composeFieldsObject from './composeFieldsObject';

const composeEmptyValues = (entityConfig: EntityConfig): Object => {
  const fieldsObject = composeFieldsObject(entityConfig);

  const result = Object.keys(fieldsObject).reduce((prev, name) => {
    const {
      attributes: { array },
      kind,
    } = fieldsObject[name];

    if (array) {
      prev[name] = []; // eslint-disable-line no-param-reassign
    } else if (
      fieldsObject[name].kind === 'embeddedFields' ||
      fieldsObject[name].kind === 'fileFields'
    ) {
      const { config } = fieldsObject[name].attributes;
      prev[name] = composeEmptyValues(config); // eslint-disable-line no-param-reassign
    } else if (kind === 'booleanFields') {
      prev[name] = false; // eslint-disable-line no-param-reassign
    } else if (fieldsObject[name].kind === 'geospatialFields') {
      const { geospatialType } = fieldsObject[name].attributes;
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
