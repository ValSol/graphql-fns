import type { EntityConfig } from '../../../tsTypes';

import fromGlobalId from '../fromGlobalId';

const processField = (globalId: any) => {
  if (!globalId) return globalId;

  const { _id: id } = fromGlobalId(globalId);

  return id;
};

const processWhere = (where: any, entityConfig: EntityConfig | null): any => {
  const { duplexFields = [], relationalFields = [] } = (entityConfig as any) || {};

  const fieldsObject = [...duplexFields, ...relationalFields].reduce<Record<string, any>>(
    (prev, field) => {
      prev[field.name] = field; // eslint-disable-line no-param-reassign

      return prev;
    },
    {},
  );

  return Object.keys(where).reduce<Record<string, any>>((prev, key) => {
    const [baseKey, suffix] = key.split('_');

    if (key === 'id') {
      prev[key] = processField(where[key]); // eslint-disable-line no-param-reassign
    } else if (key === 'id_in') {
      prev[key] = where[key].map(processField); // eslint-disable-line no-param-reassign
    } else if (key === 'id_nin') {
      prev[key] = where[key].map(processField); // eslint-disable-line no-param-reassign
    } else if (fieldsObject[baseKey]) {
      if (key === baseKey || suffix === 'ne') {
        prev[key] = processField(where[key]); // eslint-disable-line no-param-reassign
      } else if (suffix === 'in' || suffix === 'nin') {
        prev[key] = where[key].map(processField); // eslint-disable-line no-param-reassign
      } else if (suffix === 'exists') {
        prev[key] = where[key];
      } else if (key === `${baseKey}_`) {
        prev[key] = processWhere(where[key], fieldsObject[baseKey].config); // eslint-disable-line no-param-reassign
      } else {
        throw new TypeError(`Incorrect key: "${key}"!`);
      }
    } else if (key === 'AND' || key === 'NOR' || key === 'OR') {
      prev[key] = where[key].map((item) => processWhere(item, entityConfig)); // eslint-disable-line no-param-reassign
    } else {
      prev[key] = where[key]; // eslint-disable-line no-param-reassign
    }

    return prev;
  }, {});
};

const whereFromGlobalIds = (whereOne: any, entityConfig: EntityConfig): any => {
  if (Array.isArray(whereOne)) {
    return whereOne.map((whereOne2) => processWhere(whereOne2, entityConfig));
  }

  return processWhere(whereOne, entityConfig);
};

export default whereFromGlobalIds;
