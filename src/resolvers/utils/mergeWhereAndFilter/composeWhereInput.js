// @flow

import { Types } from 'mongoose';

import type { LookupMongodb, EntityConfig } from '../../../flowTypes';

import composeFieldsObject from '../../../utils/composeFieldsObject';
import composeRelationalKey from './composeRelationalKey';

const checkField = (keyWithoutSuffix, entityName, fieldsObj, entireWhere) => {
  if (!fieldsObj[keyWithoutSuffix]) {
    throw new TypeError(
      `Field "${keyWithoutSuffix}" not found in "${entityName}" entity in filter: "${entireWhere}!`,
    );
  }
};

const processIdKey = (key, suffix, prefix, embeddedPrefix, where, result, notCreateObjectId) => {
  const keyWithoutSuffix = key.slice(0, -suffix.length);

  const key2 = keyWithoutSuffix === 'id' ? '_id' : keyWithoutSuffix;

  if (!result[`${prefix}${embeddedPrefix}${key2}`]) {
    result[`${prefix}${embeddedPrefix}${key2}`] = {}; // eslint-disable-line no-param-reassign
  }

  // eslint-disable-next-line no-param-reassign
  result[`${prefix}${embeddedPrefix}${key2}`][`$${suffix.slice(1)}`] = where[key].map(
    (id) => id && (notCreateObjectId ? id : Types.ObjectId(id)),
  );
};

const processKey = (
  key,
  suffix,
  prefix,
  embeddedPrefix,
  where,
  entityName,
  fieldsObj,
  entireWhere,
  result,
) => {
  const keyWithoutSuffix = key.slice(0, -suffix.length);

  checkField(keyWithoutSuffix, entityName, fieldsObj, entireWhere);

  if (!result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`]) {
    result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`] = {}; // eslint-disable-line no-param-reassign
  }

  result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`][`$${suffix.slice(1)}`] = where[key]; // eslint-disable-line no-param-reassign
};

const composeWhereInputRecursively = (
  where: Object,
  parentFieldName: string,
  embeddedPrefix: string,
  lookupArray: Array<string>,
  entityConfig: EntityConfig,
  entireWhere: string,
  notCreateObjectId?: boolean,
): Object => {
  if (!where || !Object.keys(where).length) return {};

  const { duplexFields = [], relationalFields = [], name: entityName } = entityConfig;

  const fieldsObj = composeFieldsObject(entityConfig);

  const idFields = ['id'];

  duplexFields.reduce((prev, { name }) => {
    prev.push(name);
    return prev;
  }, idFields);

  relationalFields.reduce((prev, { name }) => {
    prev.push(name);
    return prev;
  }, idFields);

  const prefix = parentFieldName ? `${parentFieldName}.` : '';

  const result = {};

  Object.keys(where).forEach((key) => {
    if (key.endsWith('_in') && idFields.includes(key.slice(0, -'_in'.length))) {
      processIdKey(key, '_in', prefix, embeddedPrefix, where, result, notCreateObjectId);
    } else if (key.endsWith('_nin') && idFields.includes(key.slice(0, -'_nin'.length))) {
      processIdKey(key, '_nin', prefix, embeddedPrefix, where, result, notCreateObjectId);
    } else if (key.endsWith('_in')) {
      processKey(
        key,
        '_in',
        prefix,
        embeddedPrefix,
        where,
        entityName,
        fieldsObj,
        entireWhere,
        result,
      );
    } else if (key.endsWith('_lt')) {
      processKey(
        key,
        '_lt',
        prefix,
        embeddedPrefix,
        where,
        entityName,
        fieldsObj,
        entireWhere,
        result,
      );
    } else if (key.endsWith('_gt')) {
      processKey(
        key,
        '_gt',
        prefix,
        embeddedPrefix,
        where,
        entityName,
        fieldsObj,
        entireWhere,
        result,
      );
    } else if (key.endsWith('_ne')) {
      processKey(
        key,
        '_ne',
        prefix,
        embeddedPrefix,
        where,
        entityName,
        fieldsObj,
        entireWhere,
        result,
      );
    } else if (key.endsWith('_nin')) {
      processKey(
        key,
        '_nin',
        prefix,
        embeddedPrefix,
        where,
        entityName,
        fieldsObj,
        entireWhere,
        result,
      );
    } else if (key.endsWith('_lte')) {
      processKey(
        key,
        '_lte',
        prefix,
        embeddedPrefix,
        where,
        entityName,
        fieldsObj,
        entireWhere,
        result,
      );
    } else if (key.endsWith('_gte')) {
      processKey(
        key,
        '_gte',
        prefix,
        embeddedPrefix,
        where,
        entityName,
        fieldsObj,
        entireWhere,
        result,
      );
    } else if (key.endsWith('_exists')) {
      processKey(
        key,
        '_exists',
        prefix,
        embeddedPrefix,
        where,
        entityName,
        fieldsObj,
        entireWhere,
        result,
      );
    } else if (key.endsWith('_size')) {
      processKey(
        key,
        '_size',
        prefix,
        embeddedPrefix,
        where,
        entityName,
        fieldsObj,
        entireWhere,
        result,
      );
    } else if (key.slice(-3) === '_re') {
      const keyWithoutSuffix = key.slice(0, -'_re'.length);

      checkField(keyWithoutSuffix, entityName, fieldsObj, entireWhere);

      if (!result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`]) {
        result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`] = {};
      }

      result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`].$in = where[key].map(
        (item) => new RegExp(item.pattern, item.flags),
      );
    } else if (key.endsWith('_notsize')) {
      const keyWithoutSuffix = key.slice(0, -'_notsize'.length);

      checkField(keyWithoutSuffix, entityName, fieldsObj, entireWhere);

      if (!result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`]) {
        result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`] = {};
      }

      result[`${prefix}${embeddedPrefix}${keyWithoutSuffix}`].$not = { $size: where[key] };
    } else if (key === 'AND' || key === 'OR' || key === 'NOR') {
      result[`$${key.toLowerCase()}`] = where[key].map((where2) =>
        composeWhereInputRecursively(
          where2,
          parentFieldName,
          embeddedPrefix,
          lookupArray,
          entityConfig,
          entireWhere,
          notCreateObjectId,
        ),
      );
    } else if (idFields.includes(key)) {
      const key2 = key === 'id' ? '_id' : key;
      result[key2] = where[key] && (notCreateObjectId ? where[key] : Types.ObjectId(where[key]));
    } else if (key.endsWith('_')) {
      checkField(key.slice(0, -1), entityName, fieldsObj, entireWhere);

      if (parentFieldName) {
        throw new TypeError(
          `Restricted relational field: "${key}" becouse not empty "${parentFieldName}" parentField in filter: "${entireWhere}!`,
        );
      }

      const {
        relationalKey,
        entityConfig: entityConfig2,
        value,
      } = composeRelationalKey({ [key]: where[key] }, lookupArray, entityConfig);

      const result2 = composeWhereInputRecursively(
        value,
        relationalKey,
        '', // embeddedPrefix begin from ""
        lookupArray,
        entityConfig2,
        entireWhere,
        notCreateObjectId,
      );

      Object.keys(result2).forEach((key2) => {
        result[key2] = result2[key2];
      });
    } else {
      checkField(key, entityName, fieldsObj, entireWhere);

      if (fieldsObj[key].kind === 'embeddedFields' || fieldsObj[key].kind === 'fileFields') {
        const {
          attributes: { config },
        } = fieldsObj[key];

        const result2 = composeWhereInputRecursively(
          where[key],
          parentFieldName,
          `${embeddedPrefix}${key}.`,
          lookupArray,
          config,
          entireWhere,
          notCreateObjectId,
        );

        Object.keys(result2).forEach((key2) => {
          result[key2] = result2[key2];
        });
      } else {
        if (!result[`${prefix}${embeddedPrefix}${key}`]) {
          result[`${prefix}${embeddedPrefix}${key}`] = {};
        }

        result[`${prefix}${embeddedPrefix}${key}`].$eq = where[key];
      }
    }
  });
  return result;
};

const composeWhereInput = (
  where: Object,
  entityConfig: EntityConfig,
  notCreateObjectId?: boolean,
): { where: Object, lookups: Array<LookupMongodb> } => {
  const lookupArray = [];
  const where2 = composeWhereInputRecursively(
    where,
    '',
    '',
    lookupArray,
    entityConfig,
    `"${entityConfig.name}": "${JSON.stringify(where)}"`,
    notCreateObjectId,
  );

  const lookups = lookupArray.reduce((prev, fieldEntityPair) => {
    const [parentFieldName, fieldName, entityName] = fieldEntityPair.split(':');

    prev.push({
      $lookup: {
        from: `${entityName.toLowerCase()}_things`,
        localField: `${parentFieldName}${parentFieldName ? '.' : ''}${fieldName.slice(0, -1)}`,
        foreignField: '_id',
        as: `${parentFieldName}${fieldName}`,
      },
    });

    return prev;
  }, []);

  return { where: where2, lookups };
};

export default composeWhereInput;
