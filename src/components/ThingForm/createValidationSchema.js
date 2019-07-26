// @flow

import * as yup from 'yup';
import gql from 'graphql-tag';

import type { ThingConfig } from '../../flowTypes';

import composeQuery from '../../client/queries/composeQuery';
import arrangeFormFields from '../utils/arrangeFormFields';
import composeFieldsObject from '../../utils/composeFieldsObject';

type GeospatialPointSchemaArgs = { array?: boolean, required?: boolean };

const idReqExp = /^[0-9a-fA-F]{24}$/;

const floatSchema = () =>
  yup
    .number()
    .transform((currentValue, originalValue) => (originalValue === '' ? undefined : currentValue));

const dateTimeSchema = () =>
  yup
    .date()
    .transform((currentValue, originalValue) => (originalValue === '' ? undefined : currentValue));

const intSchema = () => floatSchema().integer();

const geospatialPointSchema = ({ array, required }: GeospatialPointSchemaArgs): Object =>
  yup.object().shape({
    latitude:
      required || array
        ? floatSchema()
            .min(-90, 'latitude must be greater than or equal to -90')
            .max(90, 'latitude must be less than or equal to 90')
            .required('Required')
        : floatSchema()
            .min(-90, 'latitude must be greater than or equal to -90')
            .max(90, 'latitude must be less than or equal to 90'),
    longitude:
      required || array
        ? floatSchema()
            .min(-180, 'longitude must be greater than or equal to -180')
            .max(180, 'latitude must be less than or equal to 180')
            .required('Required')
        : floatSchema()
            .min(-180, 'longitude must be greater than or equal to -180')
            .max(180, 'latitude must be less than or equal to 180'),
  });

const createValidationSchema = (
  thingConfig: ThingConfig,
  apolloClient: Object,
  id?: string,
): Object => {
  const { form, name: thingName, embedded } = thingConfig;
  const formFields = form || arrangeFormFields(thingConfig);
  const fieldsObject = composeFieldsObject(thingConfig);
  const object = formFields.reduce((prev, { name }) => {
    if (!fieldsObject[name]) return prev; // ignore: composeFlatFormikFields, crteatedAt, updatedAt

    const {
      attributes: { array, required },
      kind,
    } = fieldsObject[name];

    switch (fieldsObject[name].kind) {
      case 'embeddedFields':
        const { config } = fieldsObject[name].attributes; // eslint-disable-line no-case-declarations
        prev[name] = createValidationSchema(config, apolloClient, id); // eslint-disable-line no-param-reassign
        break;
      case 'textFields':
        prev[name] = yup.string(); // eslint-disable-line no-param-reassign
        break;
      case 'dateTimeFields':
        prev[name] = dateTimeSchema(); // eslint-disable-line no-param-reassign
        break;
      case 'intFields':
        prev[name] = intSchema(); // eslint-disable-line no-param-reassign
        break;
      case 'floatFields':
        prev[name] = floatSchema(); // eslint-disable-line no-param-reassign
        break;
      case 'geospatialFields':
        const { geospatialType } = fieldsObject[name].attributes; // eslint-disable-line no-case-declarations
        if (geospatialType === 'Point') {
          // eslint-disable-next-line no-param-reassign
          prev[name] = geospatialPointSchema({ array, required });
        } else if (geospatialType === 'Polygon') {
          // eslint-disable-next-line no-param-reassign
          prev[name] = yup.object().shape({
            externalRing: yup.object().shape({
              ring: yup.array().of(geospatialPointSchema({})),
            }),
            internalRings: yup.array().of(
              yup.object().shape({
                ring: yup.array().of(yup.object().shape(geospatialPointSchema({}))),
              }),
            ),
          });
        } else {
          throw new TypeError(`Invalid geospatialType: "${geospatialType}" of field "${name}"!`);
        }
        break;
      case 'booleanFields':
        prev[name] = yup.boolean(); // eslint-disable-line no-param-reassign
        break;
      case 'enumFields':
        prev[name] = yup.string(); // eslint-disable-line no-param-reassign
        break;
      case 'duplexFields':
        // eslint-disable-next-line no-param-reassign
        prev[name] = yup
          .string()
          .matches(idReqExp, { message: 'mongoose id', excludeEmptyString: true });
        break;
      case 'relationalFields':
        // eslint-disable-next-line no-param-reassign
        prev[name] = yup
          .string()
          .matches(idReqExp, { message: 'mongoose id', excludeEmptyString: true });
        break;

      default:
        throw new TypeError(`InvalcomposeFlatFormikFields kind: "${kind}" of thing field!`);
    }

    if (required && !['geospatialFields'].includes(kind)) {
      prev[name] = prev[name].required('Required'); // eslint-disable-line no-param-reassign
    }

    if (
      fieldsObject[name].kind === 'dateTimeFields' ||
      fieldsObject[name].kind === 'intFields' ||
      fieldsObject[name].kind === 'floatFields' ||
      fieldsObject[name].kind === 'textFields'
    ) {
      const { unique } = fieldsObject[name].attributes;
      if (unique) {
        if (embedded) {
          throw new TypeError(
            `Unacceptable unique "${name}" field in embedded thing "${thingName}"!`,
          );
        }
        const query = gql(composeQuery('thing', thingConfig, null, { include: { id: null } }));
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
    }

    if (
      fieldsObject[name].kind === 'duplexFields' ||
      fieldsObject[name].kind === 'relationalFields'
    ) {
      const { config } = fieldsObject[name].attributes;
      const query = gql(composeQuery('thing', config, null, { include: { id: null } }));
      const { name: name2 } = config;
      // eslint-disable-next-line no-param-reassign
      prev[name] = prev[name].test(`existence-${name2}`, 'Existence', async function test2(value) {
        if (!value || !idReqExp.test(value)) return true;
        const whereOne = { id: value };
        const { data } = await apolloClient.query({ query, variables: { whereOne } });
        if (data && data[name2]) return true;
        return false;
      });
    }

    if (array && !['booleanFields', 'embeddedFields', 'geospatialFields'].includes(kind)) {
      prev[name] = yup.array().of(required ? prev[name] : prev[name].required('Required')); // eslint-disable-line no-param-reassign
    } else if (array) {
      prev[name] = yup.array().of(prev[name]); // eslint-disable-line no-param-reassign
    }

    if (array && required) {
      prev[name] = prev[name].required('Required'); // eslint-disable-line no-param-reassign
    }

    return prev;
  }, {});

  return yup.object().shape(object);
};

export default createValidationSchema;
