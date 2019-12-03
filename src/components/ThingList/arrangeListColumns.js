// @flow
import type { ThingConfig, ListColumn } from '../../flowTypes';

const arrangeListColumns = (thingConfig: ThingConfig): Array<ListColumn> => {
  const {
    booleanFields,
    dateTimeFields,
    duplexFields,
    enumFields,
    fileFields,
    floatFields,
    geospatialFields,
    intFields,
    relationalFields,
    textFields,
  } = thingConfig;

  const result = [];
  const width = 200;
  const dataFieldWidth = 144;

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
      prev.push({ name, width: dataFieldWidth });
      return prev;
    }, result);
  }

  if (intFields) {
    intFields.reduce((prev, { name }) => {
      prev.push({ name, width });
      return prev;
    }, result);
  }

  if (fileFields) {
    fileFields.reduce((prev, { name }) => {
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

  result.push({ name: 'createdAt', width: dataFieldWidth });
  result.push({ name: 'updatedAt', width: dataFieldWidth });

  return result;
};

export default arrangeListColumns;
