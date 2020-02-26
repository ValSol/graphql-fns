// @flow
import type { ThingConfig, FormField } from '../../flowTypes';

const arrangeFormFields = (thingConfig: ThingConfig): Array<FormField> => {
  const {
    booleanFields,
    dateTimeFields,
    duplexFields,
    embeddedFields,
    enumFields,
    fileFields,
    floatFields,
    geospatialFields,
    intFields,
    relationalFields,
    textFields,
  } = thingConfig;

  const result = [];

  if (booleanFields) {
    booleanFields.reduce((prev, { name }) => {
      prev.push({ name });
      return prev;
    }, result);
  }

  if (enumFields) {
    enumFields.reduce((prev, { name }) => {
      prev.push({ name });
      return prev;
    }, result);
  }

  if (dateTimeFields) {
    dateTimeFields.reduce((prev, { name }) => {
      prev.push({ name });
      return prev;
    }, result);
  }

  if (textFields) {
    textFields.reduce((prev, { name }) => {
      prev.push({ name });
      return prev;
    }, result);
  }

  if (intFields) {
    intFields.reduce((prev, { name }) => {
      prev.push({ name });
      return prev;
    }, result);
  }
  if (floatFields) {
    floatFields.reduce((prev, { name }) => {
      prev.push({ name });
      return prev;
    }, result);
  }
  if (geospatialFields) {
    geospatialFields.reduce((prev, { name }) => {
      prev.push({ name });
      return prev;
    }, result);
  }
  if (embeddedFields) {
    embeddedFields.reduce((prev, { name }) => {
      prev.push({ name });
      return prev;
    }, result);
  }
  if (fileFields) {
    fileFields.reduce((prev, { name }) => {
      prev.push({ name });
      return prev;
    }, result);
  }
  if (duplexFields) {
    duplexFields.reduce((prev, { name }) => {
      prev.push({ name });
      return prev;
    }, result);
  }
  if (relationalFields) {
    relationalFields.reduce((prev, { name }) => {
      prev.push({ name });
      return prev;
    }, result);
  }

  return result;
};

export default arrangeFormFields;
