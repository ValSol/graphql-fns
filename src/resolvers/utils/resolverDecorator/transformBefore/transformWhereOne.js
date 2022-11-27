// @flow

import type { EntityConfig } from '../../../../flowTypes';

import fromGlobalId from '../../fromGlobalId';

const processWhereOne = (whereOne: Object, entityConfig: EntityConfig | null) => {
  const { duplexFields, relationalFields } = entityConfig || {};

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

const transformWhereOne = (whereOne: Object, entityConfig: EntityConfig): Object => {
  if (Array.isArray(whereOne)) {
    return whereOne.map((whereOne2) => processWhereOne(whereOne2, entityConfig));
  }

  return processWhereOne(whereOne, entityConfig);
};

export default transformWhereOne;
