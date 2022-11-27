// @flow

import type { EntityConfig } from '../../../../flowTypes';

import fromGlobalId from '../../fromGlobalId';

const processField = (globalId) => {
  if (!globalId) return globalId;

  const { _id: id } = fromGlobalId(globalId);

  return id;
};

const transformWhere = (where: Object, entityConfig: EntityConfig | null): Object => {
  const { duplexFields, relationalFields } = entityConfig || {};

  const fieldsObject = [...(duplexFields || []), ...(relationalFields || [])].reduce(
    (prev, field) => {
      prev[field.name] = field; // eslint-disable-line no-param-reassign

      return prev;
    },
    {},
  );

  return Object.keys(where).reduce((prev, key) => {
    const [baseKey, suffix] = key.split('_');

    if (key === 'id_in') {
      prev[key] = where[key].map(processField); // eslint-disable-line no-param-reassign
    } else if (key === 'id_nin') {
      prev[key] = where[key].map(processField); // eslint-disable-line no-param-reassign
    } else if (fieldsObject[baseKey]) {
      if (key === baseKey || suffix === 'ne') {
        prev[key] = processField(where[key]); // eslint-disable-line no-param-reassign
      } else if (suffix === 'in' || suffix === 'nin') {
        prev[key] = where[key].map(processField); // eslint-disable-line no-param-reassign
      } else if (key === `${baseKey}_`) {
        prev[key] = transformWhere(where[key], fieldsObject[baseKey].config); // eslint-disable-line no-param-reassign
      } else {
        throw new TypeError(`Incorrect key: "${key}"!`);
      }
    } else if (key === 'AND' || key === 'NOR' || key === 'OR') {
      prev[key] = where[key].map((item) => transformWhere(item, entityConfig)); // eslint-disable-line no-param-reassign
    } else {
      prev[key] = where[key]; // eslint-disable-line no-param-reassign
    }

    return prev;
  }, {});
};

export default transformWhere;
