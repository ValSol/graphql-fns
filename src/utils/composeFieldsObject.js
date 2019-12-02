// @flow
import type { ThingConfig, ThingConfigObject } from '../flowTypes';

const composeFieldsObject = (thingConfig: ThingConfig): ThingConfigObject => {
  const {
    booleanFields,
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
  } = thingConfig;

  const result = {};

  if (textFields) {
    textFields.reduce((prev, attributes) => {
      const { name } = attributes;
      // eslint-disable-next-line no-param-reassign
      prev[name] = { attributes, kind: 'textFields' };
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

  return result;
};

export default composeFieldsObject;
