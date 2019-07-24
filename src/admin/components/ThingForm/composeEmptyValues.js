// @flow
import type { ThingConfig } from '../../../flowTypes';

import arrangeFormFields from '../../arrangeFormFields';
import composeFieldsObject from '../../../utils/composeFieldsObject';

const composeEmptyValues = (thingConfig: ThingConfig): Object => {
  const { form } = thingConfig;
  const formFields = form || arrangeFormFields(thingConfig);
  const fieldsObject = composeFieldsObject(thingConfig);

  const result = formFields.reduce((prev, { name }) => {
    const {
      attributes: { array },
      kind,
    } = fieldsObject[name];

    if (array) {
      prev[name] = []; // eslint-disable-line no-param-reassign
    } else if (fieldsObject[name].kind === 'embeddedFields') {
      const { config } = fieldsObject[name].attributes;
      prev[name] = composeEmptyValues(config); // eslint-disable-line no-param-reassign
    } else if (kind === 'booleanFields') {
      prev[name] = false; // eslint-disable-line no-param-reassign
    } else if (fieldsObject[name].kind === 'geospatialFields') {
      const { geospatialType } = fieldsObject[name].attributes;
      if (geospatialType === 'Point') {
        prev[name] = { longitude: '', latitude: '' }; // eslint-disable-line no-param-reassign
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
