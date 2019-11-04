// @flow

import type { AdminFilters, GeneralConfig, ThingConfig } from '../../flowTypes';

const composeFilters = (thingConfig: ThingConfig, generalConfig: GeneralConfig): AdminFilters => {
  const { enums } = generalConfig;
  const enumsObject = enums
    ? enums.reduce((prev, { name, enum: enumArray }) => {
        prev[name] = enumArray; // eslint-disable-line no-param-reassign
        return prev;
      }, {})
    : {};

  const { booleanFields, enumFields } = thingConfig;
  const result = {};

  if (booleanFields) {
    booleanFields.reduce((prev, { array, index, name }) => {
      if (!array && index) {
        // eslint-disable-next-line no-param-reassign
        prev[name] = { fieldVariant: 'booleanField', value: 'all' };
      }
      return prev;
    }, result);
  }

  if (enumFields) {
    enumFields.reduce((prev, { enumName, index, name, array }) => {
      const currentEnum = enumsObject[enumName];
      if (index && array) {
        // eslint-disable-next-line no-param-reassign
        prev[name] = {
          fieldVariant: 'enumArrayField',
          value: 'all',
          enumeration: currentEnum,
        };
      } else if (index) {
        // eslint-disable-next-line no-param-reassign
        prev[name] = {
          fieldVariant: 'enumField',
          value: 'all',
          enumeration: currentEnum,
        };
      }
      return prev;
    }, result);
  }

  return result;
};

export default composeFilters;
