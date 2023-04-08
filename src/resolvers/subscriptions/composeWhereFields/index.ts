import type { EntityConfig } from '../../../tsTypes';

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
    if (index) prev[name] = 'booleanFields'; // eslint-disable-line no-param-reassign
    return prev;
  }, result);

  dateTimeFields.reduce((prev, { name, index, unique }) => {
    if (unique) {
      prev[name] = 'dateTimeFieldsArray'; // eslint-disable-line no-param-reassign
    } else if (index) {
      prev[name] = 'dateTimeFields'; // eslint-disable-line no-param-reassign
    }
    return prev;
  }, result);

  enumFields.reduce((prev, { name, index }) => {
    if (index) prev[name] = 'enumFields'; // eslint-disable-line no-param-reassign
    return prev;
  }, result);

  floatFields.reduce((prev, { name, index, unique }) => {
    if (unique) {
      prev[name] = 'floatFieldsArray'; // eslint-disable-line no-param-reassign
    } else if (index) {
      prev[name] = 'floatFields'; // eslint-disable-line no-param-reassign
    }
    return prev;
  }, result);

  intFields.reduce((prev, { name, index, unique }) => {
    if (unique) {
      prev[name] = 'intFieldsArray'; // eslint-disable-line no-param-reassign
    } else if (index) {
      prev[name] = 'intFields'; // eslint-disable-line no-param-reassign
    }
    return prev;
  }, result);

  textFields.reduce((prev, { name, index, unique }) => {
    if (unique) {
      prev[name] = 'textFieldsArray'; // eslint-disable-line no-param-reassign
    } else if (index) {
      prev[name] = 'textFields'; // eslint-disable-line no-param-reassign
    }
    return prev;
  }, result);

  if (entityType === 'tangible') {
    const { duplexFields = [], relationalFields = [] } = entityConfig;

    duplexFields.reduce((prev, { name, index, unique }) => {
      if (unique) {
        prev[name] = 'duplexFieldsArray'; // eslint-disable-line no-param-reassign
      } else if (index) {
        prev[name] = 'duplexFields'; // eslint-disable-line no-param-reassign
      }
      return prev;
    }, result);

    relationalFields.reduce((prev, { name, index, unique }) => {
      if (unique) {
        prev[name] = 'relationalFieldsArray'; // eslint-disable-line no-param-reassign
      } else if (index) {
        prev[name] = 'relationalFields'; // eslint-disable-line no-param-reassign
      }
      return prev;
    }, result);
  }
  return result;
};

export default composeWhereFields;
