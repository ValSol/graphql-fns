// @flow
import type { ThingConfig } from '../flowTypes';

import arrangeFormFields from './arrangeFormFields';
import composeFieldsObject from '../utils/composeFieldsObject';

const composeInitialValues = (thingConfig: ThingConfig, data?: Object = {}): Object => {
  const { form } = thingConfig;
  const formFields = form || arrangeFormFields(thingConfig);
  const fieldsObject = composeFieldsObject(thingConfig);

  const result = formFields.reduce((prev, { name }) => {
    const { array, config, default: defaultValue, geospatialType, kind } = fieldsObject[name];

    if (kind === 'embeddedFields') {
      prev[name] = array // eslint-disable-line no-param-reassign, no-nested-ternary
        ? data[name]
          ? data[name].map(dataItem => composeInitialValues(config, dataItem))
          : []
        : composeInitialValues(config, data[name]); // eslint-disable-line no-param-reassign
    } else if (kind === 'booleanFields') {
      // eslint-disable-next-line no-param-reassign
      prev[name] =
        data[name] === undefined || data[name] === null || data[name] === ''
          ? defaultValue || (array ? [] : false)
          : data[name];
    } else if (kind === 'geospatialFields') {
      if (geospatialType === 'Point') {
        // eslint-disable-next-line no-param-reassign
        prev[name] =
          data[name] === undefined || data[name] === null
            ? defaultValue || (array ? [] : { longitude: '', latitude: '' })
            : data[name];
      } else if (geospatialType === 'Polygon') {
        // eslint-disable-next-line no-param-reassign
        prev[name] =
          data[name] === undefined || data[name] === null
            ? defaultValue ||
              (array
                ? []
                : {
                    externalRing: {
                      ring: [],
                    },
                    internalRings: [],
                  })
            : data[name];
      } else {
        throw new TypeError(`Invalid geospatialType: "${geospatialType}" of field "${name}"!`);
      }
    } else {
      // eslint-disable-next-line no-param-reassign
      prev[name] =
        data[name] === undefined || data[name] === null
          ? defaultValue || (array ? [] : '')
          : data[name];
    }

    return prev;
  }, {});

  return result;
};

export default composeInitialValues;
