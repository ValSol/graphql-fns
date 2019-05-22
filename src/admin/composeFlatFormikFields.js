// @flow
import type { ThingConfig, FlatFormikFields } from '../flowTypes';

const arrangeFormFields = require('./arrangeFormFields');
const composeFieldsObject = require('./composeFieldsObject');

const composeFlatFormikFields = (thingConfig: ThingConfig): FlatFormikFields => {
  const { form } = thingConfig;

  const formFields = form || arrangeFormFields(thingConfig);
  const fieldsObject = composeFieldsObject(thingConfig);

  const result = formFields.reduce((prev, { name }) => {
    const { array, config, kind } = fieldsObject[name];

    switch (kind) {
      case 'embeddedFields':
        if (array) {
          prev.push({ array, config, name, child: composeFlatFormikFields(config) });
        } else {
          prev.push({ name, child: composeFlatFormikFields(config) });
        }
        break;

      case 'textFields':
        prev.push(array ? { array, name } : { name });
        break;

      default:
        throw new TypeError(`Invalid formFields kind: "${kind}" of thing field!`);
    }

    return prev;
  }, []);

  return result;
};

module.exports = composeFlatFormikFields;
