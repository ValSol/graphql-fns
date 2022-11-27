// @flow

import type { EntityConfig } from '../../../../flowTypes';

import fromGlobalId from '../../fromGlobalId';

const processItem = ({ id: globalId, ...rest }) => {
  if (!globalId) return { id: globalId, ...rest };

  const { _id: id } = fromGlobalId(globalId);

  return { ...rest, ...{ id } };
};

const processWhere = (whereOnes, duplexFieldsObject) =>
  Object.keys(whereOnes).reduce((prev, key) => {
    const duplexField = duplexFieldsObject[key];

    if (!duplexField) return prev;

    const { array } = duplexField;

    if (array) {
      prev[key] = whereOnes[key].map(processItem); // eslint-disable-line no-param-reassign
    } else {
      prev[key] = processItem(whereOnes[key]); // eslint-disable-line no-param-reassign
    }

    return prev;
  }, {});

const transformWhereOnes = (whereOnes: Object, entityConfig: EntityConfig): Object => {
  const { duplexFields } = entityConfig;

  const duplexFieldsObject = (duplexFields || []).reduce((prev, duplexField) => {
    prev[duplexField.name] = duplexField; // eslint-disable-line no-param-reassign

    return prev;
  }, {});

  if (Array.isArray(whereOnes)) {
    return whereOnes.map((whereOnesItem) => processWhere(whereOnesItem, duplexFieldsObject));
  }

  return processWhere(whereOnes, duplexFieldsObject);
};

export default transformWhereOnes;
