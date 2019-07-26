// @flow
import type { ThingConfig } from '../../flowTypes';

import arrangeFormFields from '../utils/arrangeFormFields';
import composeFieldsObject from '../../utils/composeFieldsObject';

const composeInitialValues = (thingConfig: ThingConfig, data?: Object = {}): Object => {
  const { form } = thingConfig;
  const formFields = form || arrangeFormFields(thingConfig);
  const fieldsObject = composeFieldsObject(thingConfig);

  const result = formFields.reduce((prev, { name }) => {
    const {
      attributes: { array },
    } = fieldsObject[name];

    switch (fieldsObject[name].kind) {
      case 'embeddedFields':
        const { config } = fieldsObject[name].attributes; // eslint-disable-line no-case-declarations
        prev[name] = array // eslint-disable-line no-param-reassign, no-nested-ternary
          ? data[name]
            ? data[name].map(dataItem => composeInitialValues(config, dataItem))
            : []
          : composeInitialValues(config, data[name]); // eslint-disable-line no-param-reassign
        break;

      case 'booleanFields':
        const { default: defaultValue } = fieldsObject[name].attributes; // eslint-disable-line no-case-declarations
        // eslint-disable-next-line no-param-reassign
        prev[name] =
          data[name] === undefined || data[name] === null || data[name] === ''
            ? defaultValue || (array ? [] : false)
            : data[name];
        break;

      case 'geospatialFields':
        const { geospatialType } = fieldsObject[name].attributes; // eslint-disable-line no-case-declarations
        if (geospatialType === 'Point') {
          // eslint-disable-next-line no-param-reassign
          prev[name] = // eslint-disable-next-line no-nested-ternary
            data[name] === undefined || data[name] === null
              ? array
                ? []
                : { longitude: '', latitude: '' }
              : data[name];
        } else if (geospatialType === 'Polygon') {
          // eslint-disable-next-line no-param-reassign
          prev[name] = // eslint-disable-next-line no-nested-ternary
            data[name] === undefined || data[name] === null
              ? array
                ? []
                : {
                    externalRing: {
                      ring: [],
                    },
                    internalRings: [],
                  }
              : data[name];
        } else {
          throw new TypeError(`Invalid geospatialType: "${geospatialType}" of field "${name}"!`);
        }
        break;

      case 'duplexFields':
        // eslint-disable-next-line no-param-reassign
        prev[name] = // eslint-disable-next-line no-nested-ternary
          data[name] === undefined || data[name] === null ? (array ? [] : '') : data[name];
        break;

      case 'relationalFields':
        // eslint-disable-next-line no-param-reassign
        prev[name] = // eslint-disable-next-line no-nested-ternary
          data[name] === undefined || data[name] === null ? (array ? [] : '') : data[name];
        break;

      default:
        const { default: defaultValue2 } = fieldsObject[name].attributes; // eslint-disable-line no-case-declarations
        // eslint-disable-next-line no-param-reassign
        prev[name] =
          data[name] === undefined || data[name] === null
            ? defaultValue2 || (array ? [] : '')
            : data[name];

        break;
    }

    return prev;
  }, {});

  return result;
};

export default composeInitialValues;
