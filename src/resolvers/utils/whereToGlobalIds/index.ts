import type { EntityConfig } from '../../../tsTypes';

import toGlobalId from '../toGlobalId';

const processField = (id: any, configName: string, descendantKey: string) => {
  if (!id) {
    return id;
  }

  return toGlobalId(id, configName, descendantKey);
};

const processWhere = (where: any, entityConfig: EntityConfig, descendantKey: string): any => {
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
      prev[key] = processField(where[key], entityConfig.name, descendantKey); // eslint-disable-line no-param-reassign
    } else if (key === 'id_in') {
      prev[key] = where[key].map((id) => processField(id, entityConfig.name, descendantKey)); // eslint-disable-line no-param-reassign
    } else if (key === 'id_nin') {
      prev[key] = where[key].map((id) => processField(id, entityConfig.name, descendantKey)); // eslint-disable-line no-param-reassign
    } else if (fieldsObject[baseKey]) {
      if (key === baseKey || suffix === 'ne') {
        prev[key] = processField(where[key], fieldsObject[baseKey].config.name, descendantKey); // eslint-disable-line no-param-reassign
      } else if (suffix === 'in' || suffix === 'nin') {
        prev[key] = where[key].map((id: string) =>
          processField(id, fieldsObject[baseKey].config.name, descendantKey),
        );
      } else if (suffix === 'exists') {
        prev[key] = where[key];
      } else if (key === `${baseKey}_`) {
        prev[key] = processWhere(where[key], fieldsObject[baseKey].config, descendantKey); // eslint-disable-line no-param-reassign
      } else {
        throw new TypeError(`Incorrect key: "${key}"!`);
      }
    } else if (key === 'AND' || key === 'NOR' || key === 'OR') {
      prev[key] = where[key].map((item) => processWhere(item, entityConfig, descendantKey)); // eslint-disable-line no-param-reassign
    } else {
      prev[key] = where[key]; // eslint-disable-line no-param-reassign
    }

    return prev;
  }, {});
};

const whereFromGlobalIds = (whereOne: any, entityConfig: EntityConfig, descendantKey = ''): any => {
  if (Array.isArray(whereOne)) {
    return whereOne.map((whereOne2) => processWhere(whereOne2, entityConfig, descendantKey));
  }

  return processWhere(whereOne, entityConfig, descendantKey);
};

export default whereFromGlobalIds;
