// @flow
import type { ThingConfig, FlatFormikFields } from '../flowTypes';

const arrangeFormFields = require('./arrangeFormFields');
const composeFieldsObject = require('./composeFieldsObject');

const composeFlatFormikFields = (thingConfig: ThingConfig, prefix?: string): FlatFormikFields => {
  const { form } = thingConfig;

  const formFields = form || arrangeFormFields(thingConfig);
  const fieldsObject = composeFieldsObject(thingConfig);

  const result = formFields.reduce((prev, { name }) => {
    const { array, config, kind } = fieldsObject[name];

    const flatName = prefix ? `${prefix}.${name}` : name;
    switch (kind) {
      case 'embeddedFields':
        if (array) {
          prev.push({ arrayName: flatName, children: composeFlatFormikFields(config) });
        } else {
          prev.push.apply(prev, composeFlatFormikFields(config, flatName)); // eslint-disable-line prefer-spread
        }
        break;

      case 'textFields':
        prev.push(array ? { arrayName: flatName } : { fieldName: flatName });
        break;

      default:
        throw new TypeError(`Invalid formFields kind: "${kind}" of thing field!`);
    }

    return prev;
  }, []);

  return result;
};

module.exports = composeFlatFormikFields;
