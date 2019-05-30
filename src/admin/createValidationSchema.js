// @flow

import * as yup from 'yup';
import gql from 'graphql-tag';

import type { ThingConfig } from '../flowTypes';

import composeQuery from '../client/queries/composeQuery';
import arrangeFormFields from './arrangeFormFields';
import composeFieldsObject from './composeFieldsObject';

const createValcomposeFlatFormikFieldsationSchema = (
  thingConfig: ThingConfig,
  apolloClient: Object,
  id?: string,
): Object => {
  const { form, name: thingName } = thingConfig;
  const formFields = form || arrangeFormFields(thingConfig);
  const fieldsObject = composeFieldsObject(thingConfig);
  const object = formFields.reduce((prev, { name }) => {
    if (!fieldsObject[name]) return prev; // ignore: composeFlatFormikFields, crteatedAt, updatedAt

    const { array, config, embedded, kind, required, unique } = fieldsObject[name];

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

    if (unique) {
      if (embedded) {
        throw new TypeError(
          `Unacceptable unique "${name}" field in embedded thing "${thingName}"!`,
        );
      }
      const query = gql(composeQuery('thing', thingConfig, { include: { id: null } }));
      // eslint-disable-next-line no-param-reassign
      prev[name] = prev[name].test(`unique-${thingName}-${name}`, 'Unique', async function test(
        value,
      ) {
        if (!value) return true;
        const whereOne = { [name]: value };
        const { data } = await apolloClient.query({ query, variables: { whereOne } });
        if (data && data[thingName] && data[thingName].id !== id) return false;
        return true;
      });
    }

    if (array) {
      prev[name] = yup.array().of(prev[name]); // eslint-disable-line no-param-reassign
    }

    return prev;
  }, {});

  return yup.object().shape(object);
};

export default createValcomposeFlatFormikFieldsationSchema;
