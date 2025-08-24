import type { EntityConfig } from '@/tsTypes';

const composeWhereFields = (entityConfig: EntityConfig): any => {
  const {
    booleanFields = [],
    dateTimeFields = [],
    enumFields = [],
    floatFields = [],
    intFields = [],
    textFields = [],
    type: entityType,
  } = entityConfig;

  const result = { id: 'idArray' } as const;

  booleanFields.reduce((prev, { name, index }) => {
    if (index) prev[name] = 'booleanFields';
    return prev;
  }, result);

  dateTimeFields.reduce((prev, { name, index, unique }) => {
    if (unique) {
      prev[name] = 'dateTimeFieldsArray';
    } else if (index) {
      prev[name] = 'dateTimeFields';
    }
    return prev;
  }, result);

  enumFields.reduce((prev, { name, index }) => {
    if (index) prev[name] = 'enumFields';
    return prev;
  }, result);

  floatFields.reduce((prev, { name, index, unique }) => {
    if (unique) {
      prev[name] = 'floatFieldsArray';
    } else if (index) {
      prev[name] = 'floatFields';
    }
    return prev;
  }, result);

  intFields.reduce((prev, { name, index, unique }) => {
    if (unique) {
      prev[name] = 'intFieldsArray';
    } else if (index) {
      prev[name] = 'intFields';
    }
    return prev;
  }, result);

  textFields.reduce((prev, { name, index, unique }) => {
    if (unique) {
      prev[name] = 'textFieldsArray';
    } else if (index) {
      prev[name] = 'textFields';
    }
    return prev;
  }, result);

  if (entityType === 'tangible') {
    const { duplexFields = [], relationalFields = [] } = entityConfig;

    duplexFields.reduce((prev, { name, index, unique }) => {
      if (unique) {
        prev[name] = 'duplexFieldsArray';
      } else if (index) {
        prev[name] = 'duplexFields';
      }
      return prev;
    }, result);

    relationalFields.reduce((prev, { name, index, unique }) => {
      if (unique) {
        prev[name] = 'relationalFieldsArray';
      } else if (index) {
        prev[name] = 'relationalFields';
      }
      return prev;
    }, result);
  }
  return result;
};

export default composeWhereFields;
