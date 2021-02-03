// @flow

import { Types } from 'mongoose';

import type { LookupMongodb, ThingConfig } from '../flowTypes';

import composeFieldsObject from '../utils/composeFieldsObject';

const composeWhereInputRecursively = (
  where: Object,
  lookupObject: { [fieldName: string]: string },
  thingConfig: ThingConfig,
): Object => {
  if (!where || !Object.keys(where).length) return {};

  const { duplexFields, relationalFields } = thingConfig;

  const fieldsObject = composeFieldsObject(thingConfig);

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

  const result = {};
  Object.keys(where).forEach((rawKey) => {
    const rawKeyArr = rawKey.split('__');
    const { key, parentField } =
      rawKeyArr.length === 2
        ? { parentField: rawKeyArr[0], key: rawKeyArr[1] }
        : { parentField: '', key: rawKey };

    const prefix = parentField ? `${parentField}_.` : '';

    if (parentField) {
      const {
        attributes: {
          // $FlowFixMe
          config: { name: thingName },
        },
      } = fieldsObject[parentField];

      lookupObject[parentField] = thingName; // eslint-disable-line no-param-reassign
    }

    if (key.slice(-3) === '_in' && idFields.includes(key.slice(0, -3))) {
      const key2 = key.slice(0, -3) === 'id' ? '_id' : key.slice(0, -3);
      result[`${prefix}${key2}`] = {
        [`$${key.slice(-2)}`]: where[key].map((id) => id && Types.ObjectId(id)),
      };
    } else if (key.slice(-4) === '_nin' && idFields.includes(key.slice(0, -4))) {
      const key2 = key.slice(0, -4) === 'id' ? '_id' : key.slice(0, -4);
      result[`${prefix}${key2}`] = {
        [`$${key.slice(-3)}`]: where[key].map((id) => id && Types.ObjectId(id)),
      };
    } else if (
      key.slice(-3) === '_in' ||
      key.slice(-3) === '_lt' ||
      key.slice(-3) === '_gt' ||
      key.slice(-3) === '_ne'
    ) {
      result[`${prefix}${key.slice(0, -3)}`] = { [`$${key.slice(-2)}`]: where[rawKey] };
    } else if (key.slice(-4) === '_nin' || key.slice(-4) === '_lte' || key.slice(-4) === '_gte') {
      result[`${prefix}${key.slice(0, -4)}`] = { [`$${key.slice(-3)}`]: where[rawKey] };
    } else if (key.slice(-3) === '_re') {
      result[`${prefix}${key.slice(0, -3)}`] = {
        $in: where[rawKey].map((item) => new RegExp(item.pattern, item.flags)),
      };
    } else if (key === 'AND' || key === 'OR' || key === 'NOR') {
      result[`$${key.toLowerCase()}`] = where[rawKey].map((where2) =>
        composeWhereInputRecursively(where2, lookupObject, thingConfig),
      );
    } else if (idFields.includes(key)) {
      const key2 = key === 'id' ? '_id' : key;
      result[`${prefix}${key2}`] = where[rawKey] && Types.ObjectId(where[rawKey]);
    } else {
      result[`${prefix}${key}`] = where[rawKey];
    }
  });
  return result;
};

const composeWhereInput = (
  where: Object,
  thingConfig: ThingConfig,
): { where: Object, lookups: Array<LookupMongodb> } => {
  const lookupObject = {};
  const where2 = composeWhereInputRecursively(where, lookupObject, thingConfig);

  const lookups = Object.keys(lookupObject).reduce((prev, parentFieldName) => {
    const thingName = lookupObject[parentFieldName];

    prev.push({
      $lookup: {
        from: `${thingName.toLowerCase()}_things`,
        localField: parentFieldName,
        foreignField: '_id',
        as: `${parentFieldName}_`,
      },
    });

    return prev;
  }, []);

  return { where: where2, lookups };
};

export default composeWhereInput;
