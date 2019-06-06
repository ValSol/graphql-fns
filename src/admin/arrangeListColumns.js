// @flow
import type { ThingConfig, ListColumn } from '../flowTypes';

const arrangeListColumns = (thingConfig: ThingConfig): Array<ListColumn> => {
  const {
    booleanFields,
    dateTimeFields,
    duplexFields,
    enumFields,
    floatFields,
    geospatialFields,
    intFields,
    relationalFields,
    textFields,
  } = thingConfig;

  const result = [];
  const width = 200;

  if (textFields) {
    textFields.reduce((prev, { name }) => {
      prev.push({ name, width });
      return prev;
    }, result);
  }

  if (booleanFields) {
    booleanFields.reduce((prev, { name }) => {
      prev.push({ name, width });
      return prev;
    }, result);
  }

  if (enumFields) {
    enumFields.reduce((prev, { name }) => {
      prev.push({ name, width });
      return prev;
    }, result);
  }

  if (dateTimeFields) {
    dateTimeFields.reduce((prev, { name }) => {
      prev.push({ name, width });
      return prev;
    }, result);
  }

  if (intFields) {
    intFields.reduce((prev, { name }) => {
      prev.push({ name, width });
      return prev;
    }, result);
  }
  if (floatFields) {
    floatFields.reduce((prev, { name }) => {
      prev.push({ name, width });
      return prev;
    }, result);
  }
  if (geospatialFields) {
    geospatialFields.reduce((prev, { name }) => {
      prev.push({ name, width });
      return prev;
    }, result);
  }
  if (duplexFields) {
    duplexFields.reduce((prev, { name }) => {
      prev.push({ name, width });
      return prev;
    }, result);
  }
  if (relationalFields) {
    relationalFields.reduce((prev, { name }) => {
      prev.push({ name, width });
      return prev;
    }, result);
  }

  result.push({ name: 'createdAt', width: 220 });
  result.push({ name: 'updatedAt', width: 220 });

  return result;
};

export default arrangeListColumns;