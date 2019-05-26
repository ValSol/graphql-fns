// @flow
import type { ThingConfig, FormField } from '../flowTypes';

const arrangeFormFields = (thingConfig: ThingConfig): Array<FormField> => {
  const {
    booleanFields,
    dateTimeFields,
    textFields,
    intFields,
    floatFields,
    geospatialFields,
    embeddedFields,
    duplexFields,
    relationalFields,
  } = thingConfig;

  const result = [];

  if (booleanFields) {
    booleanFields.reduce((prev, { name, default: value }) => {
      const obj = {};
      obj.name = name;
      if (value !== undefined) obj.value = value;
      prev.push(obj);
      return prev;
    }, result);
  }

  if (dateTimeFields) {
    dateTimeFields.reduce((prev, { name, default: value }) => {
      const obj = {};
      obj.name = name;
      if (value !== undefined) obj.value = value;
      prev.push(obj);
      return prev;
    }, result);
  }

  if (textFields) {
    textFields.reduce((prev, { name, default: value }) => {
      const obj = {};
      obj.name = name;
      if (value !== undefined) obj.value = value;
      prev.push(obj);
      return prev;
    }, result);
  }

  if (intFields) {
    intFields.reduce((prev, { name, default: value }) => {
      const obj = {};
      obj.name = name;
      if (value !== undefined) obj.value = value;
      prev.push(obj);
      return prev;
    }, result);
  }
  if (floatFields) {
    floatFields.reduce((prev, { name, default: value }) => {
      const obj = {};
      obj.name = name;
      if (value !== undefined) obj.value = value;
      prev.push(obj);
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
