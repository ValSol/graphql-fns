// @flow
import type { ThingConfig } from '../flowTypes';

const Yup = require('yup');

const arrangeFormFields = require('./arrangeFormFields');
const composeFieldsObject = require('./composeFieldsObject');

const createValidationSchema = (thingConfig: ThingConfig): Object => {
  const { form } = thingConfig;
  const formFields = form || arrangeFormFields(thingConfig);
  const fieldsObject = composeFieldsObject(thingConfig);
  const object = formFields.reduce((prev, { name }) => {
    if (!fieldsObject[name]) return prev; // ignore: id, crteatedAt, updatedAt

    const { array, config, kind, required } = fieldsObject[name];

    switch (kind) {
      case 'embeddedFields':
        prev[name] = createValidationSchema(config); // eslint-disable-line no-param-reassign
        break;
      case 'textFields':
        prev[name] = Yup.string(); // eslint-disable-line no-param-reassign
        break;
      default:
        throw new TypeError(`Invalid kind: "${kind}" of thing field!`);
    }

    if (array) {
      prev[name] = Yup.array().of(prev[name]); // eslint-disable-line no-param-reassign
    }

    if (required) prev[name] = prev[name].required('Required'); // eslint-disable-line no-param-reassign

    return prev;
  }, {});

  const object2 = {};
  object2.textField = Yup.string();

  return Yup.object().shape(object);
};

module.exports = createValidationSchema;
