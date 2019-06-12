// @flow
import type { ThingConfig } from '../flowTypes';

import arrangeFormFields from './arrangeFormFields';
import composeFieldsObject from '../utils/composeFieldsObject';

const composeEmptyValues = (thingConfig: ThingConfig): Object => {
  const { form } = thingConfig;
  const formFields = form || arrangeFormFields(thingConfig);
  const fieldsObject = composeFieldsObject(thingConfig);

  const result = formFields.reduce((prev, { name }) => {
    const { array, config, kind } = fieldsObject[name];

    if (kind === 'embeddedFields') {
      prev[name] = array // eslint-disable-line no-param-reassign, no-nested-ternary
        ? []
        : composeEmptyValues(config); // eslint-disable-line no-param-reassign
    } else if (kind === 'booleanFields') {
      // eslint-disable-next-line no-param-reassign
      prev[name] = array ? [] : false; // eslint-disable-line no-param-reassign
    } else {
      // eslint-disable-next-line no-param-reassign
      prev[name] = array ? [] : ''; // eslint-disable-line no-param-reassign
    }

    return prev;
  }, {});

  return result;
};

module.exports = composeEmptyValues;
