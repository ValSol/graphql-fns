//  @flow

import type { ThingConfig } from '../../flowTypes';

const composeWhereFields = (thingConfig: ThingConfig): Object => {
  const {
    booleanFields,
    dateTimeFields,
    duplexFields,
    enumFields,
    floatFields,
    intFields,
    relationalFields,
    textFields,
  } = thingConfig;

  const result = { id: 'idArray' };

  if (booleanFields) {
    booleanFields.reduce((prev, { name, index }) => {
      if (index) prev[name] = 'booleanFields'; // eslint-disable-line no-param-reassign
      return prev;
    }, result);
  }

  if (dateTimeFields) {
    dateTimeFields.reduce((prev, { name, index, unique }) => {
      if (unique) {
        prev[name] = 'dateTimeFieldsArray'; // eslint-disable-line no-param-reassign
      } else if (index) {
        prev[name] = 'dateTimeFields'; // eslint-disable-line no-param-reassign
      }
      return prev;
    }, result);
  }

  if (duplexFields) {
    duplexFields.reduce((prev, { name, index, unique }) => {
      if (unique) {
        prev[name] = 'duplexFieldsArray'; // eslint-disable-line no-param-reassign
      } else if (index) {
        prev[name] = 'duplexFields'; // eslint-disable-line no-param-reassign
      }
      return prev;
    }, result);
  }

  if (enumFields) {
    enumFields.reduce((prev, { name, index }) => {
      if (index) prev[name] = 'enumFields'; // eslint-disable-line no-param-reassign
      return prev;
    }, result);
  }

  if (floatFields) {
    floatFields.reduce((prev, { name, index, unique }) => {
      if (unique) {
        prev[name] = 'floatFieldsArray'; // eslint-disable-line no-param-reassign
      } else if (index) {
        prev[name] = 'floatFields'; // eslint-disable-line no-param-reassign
      }
      return prev;
    }, result);
  }

  if (intFields) {
    intFields.reduce((prev, { name, index, unique }) => {
      if (unique) {
        prev[name] = 'intFieldsArray'; // eslint-disable-line no-param-reassign
      } else if (index) {
        prev[name] = 'intFields'; // eslint-disable-line no-param-reassign
      }
      return prev;
    }, result);
  }

  if (relationalFields) {
    relationalFields.reduce((prev, { name, index, unique }) => {
      if (unique) {
        prev[name] = 'relationalFieldsArray'; // eslint-disable-line no-param-reassign
      } else if (index) {
        prev[name] = 'relationalFields'; // eslint-disable-line no-param-reassign
      }
      return prev;
    }, result);
  }

  if (textFields) {
    textFields.reduce((prev, { name, index, unique }) => {
      if (unique) {
        prev[name] = 'textFieldsArray'; // eslint-disable-line no-param-reassign
      } else if (index) {
        prev[name] = 'textFields'; // eslint-disable-line no-param-reassign
      }
      return prev;
    }, result);
  }

  return result;
};

export default composeWhereFields;
