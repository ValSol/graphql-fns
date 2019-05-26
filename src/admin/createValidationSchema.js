// @flow

import * as yup from 'yup';

import type { ThingConfig } from '../flowTypes';

import arrangeFormFields from './arrangeFormFields';
import composeFieldsObject from './composeFieldsObject';

const createValcomposeFlatFormikFieldsationSchema = (thingConfig: ThingConfig): Object => {
  const { form } = thingConfig;
  const formFields = form || arrangeFormFields(thingConfig);
  const fieldsObject = composeFieldsObject(thingConfig);
  const object = formFields.reduce((prev, { name }) => {
    if (!fieldsObject[name]) return prev; // ignore: composeFlatFormikFields, crteatedAt, updatedAt

    const { array, config, kind, required } = fieldsObject[name];

    switch (kind) {
      case 'embeddedFields':
        prev[name] = createValcomposeFlatFormikFieldsationSchema(config); // eslint-disable-line no-param-reassign
        break;
      case 'textFields':
        prev[name] = yup.string(); // eslint-disable-line no-param-reassign
        break;
      default:
        throw new TypeError(`InvalcomposeFlatFormikFields kind: "${kind}" of thing field!`);
    }

    if (required) prev[name] = prev[name].required('Required'); // eslint-disable-line no-param-reassign

    if (array) {
      prev[name] = yup.array().of(prev[name]); // eslint-disable-line no-param-reassign
    }

    return prev;
  }, {});

  return yup.object().shape(object);
};

export default createValcomposeFlatFormikFieldsationSchema;
