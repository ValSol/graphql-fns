// @flow

import type { ThingConfig } from '../../../../flowTypes';

import fromGlobalId from '../../fromGlobalId';

const processWhereOne = (whereOne: Object, thingConfig: ThingConfig | null) => {
  const { duplexFields, relationalFields } = thingConfig || {};

  const transformedFieldsObject = whereOne.id ? { id: true } : {};

  [...(duplexFields || []), ...(relationalFields || [])].reduce((prev, field) => {
    if (field.unique) {
      prev[field.name] = true; // eslint-disable-line no-param-reassign
    }

    return prev;
  }, transformedFieldsObject);

  const result = Object.keys(whereOne).reduce((prev, key) => {
    if (transformedFieldsObject[key]) {
      const { _id: id } = fromGlobalId(whereOne[key]);

      prev[key] = id; // eslint-disable-line no-param-reassign
    } else {
      prev[key] = whereOne[key]; // eslint-disable-line no-param-reassign
    }
    return prev;
  }, {});

  return result;
};

const transformWhereOne = (whereOne: Object, thingConfig: ThingConfig): Object => {
  if (Array.isArray(whereOne)) {
    return whereOne.map((whereOne2) => processWhereOne(whereOne2, thingConfig));
  }

  return processWhereOne(whereOne, thingConfig);
};

export default transformWhereOne;
