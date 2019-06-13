// @flow
import type { ThingConfig } from '../flowTypes';

import arrangeFormFields from './arrangeFormFields';
import composeFieldsObject from '../utils/composeFieldsObject';

const composeInitialValues = (thingConfig: ThingConfig, data?: Object = {}): Object => {
  const { form } = thingConfig;
  const formFields = form || arrangeFormFields(thingConfig);
  const fieldsObject = composeFieldsObject(thingConfig);

  const result = formFields.reduce((prev, { name }) => {
    const { array, config, default: defaultValue, kind } = fieldsObject[name];

    if (kind === 'embeddedFields') {
      prev[name] = array // eslint-disable-line no-param-reassign, no-nested-ternary
        ? data[name]
          ? data[name].map(dataItem => composeInitialValues(config, dataItem))
          : []
        : composeInitialValues(config, data[name]); // eslint-disable-line no-param-reassign
    } else if (kind === 'booleanFields') {
      // eslint-disable-next-line no-param-reassign
      prev[name] =
        data[name] === undefined || data[name] === null
          ? defaultValue || (array ? [] : false)
          : data[name];
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

module.exports = composeInitialValues;
