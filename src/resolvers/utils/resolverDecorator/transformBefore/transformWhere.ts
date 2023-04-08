import type { EntityConfig } from '../../../../tsTypes';

import fromGlobalId from '../../fromGlobalId';

const processField = (globalId: any) => {
  if (!globalId) return globalId;

  const { _id: id } = fromGlobalId(globalId);

  return id;
};

const transformWhere = (where: any, entityConfig: EntityConfig | null): any => {
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
