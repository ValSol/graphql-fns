// @flow
import type { ThingConfig } from '../flowTypes';

const arrangeFormFields = require('./arrangeFormFields');
const composeFieldsObject = require('./composeFieldsObject');

const composeInitialValues = (thingConfig: ThingConfig, data?: Object = {}): Object => {
  const { form } = thingConfig;
  const formFields = form || arrangeFormFields(thingConfig);
  const fieldsObject = composeFieldsObject(thingConfig);

  const result = formFields.reduce((prev, { name }) => {
    if (!fieldsObject[name]) return prev; // ignore: id, crteatedAt, updatedAt

    const { array, config, default: defaultValue, kind } = fieldsObject[name];

    switch (kind) {
      case 'embeddedFields':
        prev[name] = array // eslint-disable-line no-param-reassign, no-nested-ternary
          ? data && data[name]
            ? data[name].map(dataItem => composeInitialValues(config, dataItem))
            : []
          : composeInitialValues(config, data[name]); // eslint-disable-line no-param-reassign
        break;
      case 'textFields':
        // eslint-disable-next-line no-param-reassign
        prev[name] = data[name] !== undefined ? data[name] : defaultValue || (array ? [] : '');
        break;
      default:
        throw new TypeError(`Invalid kind: "${kind}" of thing field!`);
    }

    return prev;
  }, {});

  return result;
};

module.exports = composeInitialValues;
