// @flow

import { Types } from 'mongoose';

import type { LookupMongodb, ThingConfig } from '../flowTypes';

import composeRelationalKey from './composeRelationalKey';

const composeWhereInputRecursively = (
  where: Object,
  parentFieldName: string,
  lookupArray: Array<string>,
  thingConfig: ThingConfig,
  notCreateObjectId?: boolean,
): Object => {
  if (!where || !Object.keys(where).length) return {};

  const { duplexFields, relationalFields } = thingConfig;

  const idFields = ['id'];
  if (duplexFields) {
    duplexFields.reduce((prev, { name }) => {
      prev.push(name);
      return prev;
    }, idFields);
  }
  if (relationalFields) {
    relationalFields.reduce((prev, { name }) => {
      prev.push(name);
      return prev;
    }, idFields);
  }

  const prefix = parentFieldName ? `${parentFieldName}.` : '';

  const result = {};
  Object.keys(where).forEach((key) => {
    if (key.slice(-3) === '_in' && idFields.includes(key.slice(0, -3))) {
      const key2 = key.slice(0, -3) === 'id' ? '_id' : key.slice(0, -3);

      result[`${prefix}${key2}`] = {
        [`$${key.slice(-2)}`]: where[key].map(
          (id) => id && (notCreateObjectId ? id : Types.ObjectId(id)),
        ),
      };
    } else if (key.slice(-4) === '_nin' && idFields.includes(key.slice(0, -4))) {
      const key2 = key.slice(0, -4) === 'id' ? '_id' : key.slice(0, -4);

      result[`${prefix}${key2}`] = {
        [`$${key.slice(-3)}`]: where[key].map(
          (id) => id && (notCreateObjectId ? id : Types.ObjectId(id)),
        ),
      };
    } else if (
      key.slice(-3) === '_in' ||
      key.slice(-3) === '_lt' ||
      key.slice(-3) === '_gt' ||
      key.slice(-3) === '_ne'
    ) {
      result[`${prefix}${key.slice(0, -3)}`] = { [`$${key.slice(-2)}`]: where[key] };
    } else if (key.slice(-4) === '_nin' || key.slice(-4) === '_lte' || key.slice(-4) === '_gte') {
      result[`${prefix}${key.slice(0, -4)}`] = { [`$${key.slice(-3)}`]: where[key] };
    } else if (key.slice(-3) === '_re') {
      result[`${prefix}${key.slice(0, -3)}`] = {
        $in: where[key].map((item) => new RegExp(item.pattern, item.flags)),
      };
    } else if (key.endsWith('_exists')) {
      result[`${prefix}${key.slice(0, -7)}`] = { [`$${key.slice(-6)}`]: where[key] };
    } else if (key === 'AND' || key === 'OR' || key === 'NOR') {
      result[`$${key.toLowerCase()}`] = where[key].map((where2) =>
        composeWhereInputRecursively(
          where2,
          parentFieldName,
          lookupArray,
          thingConfig,
          notCreateObjectId,
        ),
      );
    } else if (idFields.includes(key)) {
      const key2 = key === 'id' ? '_id' : key;
      result[key2] = where[key] && (notCreateObjectId ? where[key] : Types.ObjectId(where[key]));
    } else if (key.endsWith('_')) {
      if (parentFieldName) {
        throw new TypeError(
          `Restricted relational field: "${key}" becouse not empty "${parentFieldName}" parentField!`,
        );
      }

      const { relationalKey, thingConfig: thingConfig2, value } = composeRelationalKey(
        { [key]: where[key] },
        lookupArray,
        thingConfig,
      );

      const result2 = composeWhereInputRecursively(
        value,
        relationalKey,
        lookupArray,
        thingConfig2,
        notCreateObjectId,
      );

      Object.keys(result2).forEach((key2) => {
        result[key2] = result2[key2];
      });
    } else {
      result[`${prefix}${key}`] = where[key];
    }
  });
  return result;
};

const composeWhereInput = (
  where: Object,
  thingConfig: ThingConfig,
  notCreateObjectId?: boolean,
): { where: Object, lookups: Array<LookupMongodb> } => {
  const lookupArray = [];
  const where2 = composeWhereInputRecursively(
    where,
    '',
    lookupArray,
    thingConfig,
    notCreateObjectId,
  );

  const lookups = lookupArray.reduce((prev, fieldThingPair) => {
    const [parentFieldName, fieldName, thingName] = fieldThingPair.split(':');

    prev.push({
      $lookup: {
        from: `${thingName.toLowerCase()}_things`,
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
