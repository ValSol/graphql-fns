// @flow
import type { EntityConfig, EntityConfigObject } from '../flowTypes';

const store = Object.create(null);

const composeFieldsObject = (entityConfig: EntityConfig): EntityConfigObject => {
  const {
    name: entityName,
    booleanFields,
    childFields,
    dateTimeFields,
    duplexFields,
    embeddedFields,
    enumFields,
    floatFields,
    geospatialFields,
    intFields,
    relationalFields,
    textFields,
    fileFields,
  } = entityConfig;

  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[entityName]) return store[entityName];

  const result = {};

  if (textFields) {
    textFields.reduce((prev, attributes) => {
      const { name } = attributes;
      // eslint-disable-next-line no-param-reassign
      prev[name] = { attributes, kind: 'textFields' };
      return prev;
    }, result);
  }

  if (intFields) {
    intFields.reduce((prev, attributes) => {
      const { name } = attributes;
      // eslint-disable-next-line no-param-reassign
      prev[name] = { attributes, kind: 'intFields' };
      return prev;
    }, result);
  }

  if (floatFields) {
    floatFields.reduce((prev, attributes) => {
      const { name } = attributes;
      // eslint-disable-next-line no-param-reassign
      prev[name] = { attributes, kind: 'floatFields' };
      return prev;
    }, result);
  }

  if (dateTimeFields) {
    dateTimeFields.reduce((prev, attributes) => {
      const { name } = attributes;
      // eslint-disable-next-line no-param-reassign
      prev[name] = { attributes, kind: 'dateTimeFields' };
      return prev;
    }, result);
  }

  if (booleanFields) {
    booleanFields.reduce((prev, attributes) => {
      const { name } = attributes;
      // eslint-disable-next-line no-param-reassign
      prev[name] = { attributes, kind: 'booleanFields' };
      return prev;
    }, result);
  }

  if (embeddedFields) {
    embeddedFields.reduce((prev, attributes) => {
      const { name } = attributes;
      // eslint-disable-next-line no-param-reassign
      prev[name] = { attributes, kind: 'embeddedFields' };
      return prev;
    }, result);
  }

  if (fileFields) {
    fileFields.reduce((prev, attributes) => {
      const { name } = attributes;
      // eslint-disable-next-line no-param-reassign
      prev[name] = { attributes, kind: 'fileFields' };
      return prev;
    }, result);
  }

  if (enumFields) {
    enumFields.reduce((prev, attributes) => {
      const { name } = attributes;
      // eslint-disable-next-line no-param-reassign
      prev[name] = { attributes, kind: 'enumFields' };
      return prev;
    }, result);
  }

  if (geospatialFields) {
    geospatialFields.reduce((prev, attributes) => {
      const { name } = attributes;
      // eslint-disable-next-line no-param-reassign
      prev[name] = { attributes, kind: 'geospatialFields' };
      return prev;
    }, result);
  }

  if (duplexFields) {
    duplexFields.reduce((prev, attributes) => {
      const { name } = attributes;
      // eslint-disable-next-line no-param-reassign
      prev[name] = { attributes, kind: 'duplexFields' };
      return prev;
    }, result);
  }

  if (relationalFields) {
    relationalFields.reduce((prev, attributes) => {
      const { name } = attributes;
      // eslint-disable-next-line no-param-reassign
      prev[name] = { attributes, kind: 'relationalFields' };
      return prev;
    }, result);
  }

  if (childFields) {
    childFields.reduce((prev, attributes) => {
      const { name } = attributes;
      // eslint-disable-next-line no-param-reassign
      prev[name] = { attributes, kind: 'childFields' };
      return prev;
    }, result);
  }

  store[entityName] = result;

  return result;
};

export default composeFieldsObject;
