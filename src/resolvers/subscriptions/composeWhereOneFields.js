//   @flow

import type { ThingConfig } from '../../flowTypes';

const composeWhereOneFields = (thingConfig: ThingConfig): Object => {
  const { dateTimeFields, intFields, floatFields, textFields } = thingConfig;

  const result = { id: null };

  if (dateTimeFields) {
    dateTimeFields.reduce((prev, { name, unique }) => {
      if (unique) prev[name] = 'dateTimeFields'; // eslint-disable-line no-param-reassign
      return prev;
    }, result);
  }

  if (intFields) {
    intFields.reduce((prev, { name, unique }) => {
      if (unique) prev[name] = 'intFields'; // eslint-disable-line no-param-reassign
      return prev;
    }, result);
  }

  if (floatFields) {
    floatFields.reduce((prev, { name, unique }) => {
      if (unique) prev[name] = 'floatFields'; // eslint-disable-line no-param-reassign
      return prev;
    }, result);
  }

  if (textFields) {
    textFields.reduce((prev, { name, unique }) => {
      if (unique) prev[name] = 'textFields'; // eslint-disable-line no-param-reassign
      return prev;
    }, result);
  }

  return result;
};

export default composeWhereOneFields;
