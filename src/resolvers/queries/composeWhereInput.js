// @flow

import { Types } from 'mongoose';

import type { ThingConfig } from '../../flowTypes';

const composeWhereInput = (where: Object, thingConfig: ThingConfig): null | Object => {
  if (!where || !Object.keys(where).length) return null;

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

  const result = {};
  Object.keys(where).forEach((key) => {
    if (key.slice(-3) === '_in' && idFields.includes(key.slice(0, -3))) {
      const key2 = key.slice(0, -3) === 'id' ? '_id' : key.slice(0, -3);
      result[key2] = {
        [`$${key.slice(-2)}`]: where[key].map((id) => Types.ObjectId(id)),
      };
    } else if (key.slice(-4) === '_nin' && idFields.includes(key.slice(0, -4))) {
      const key2 = key.slice(0, -4) === 'id' ? '_id' : key.slice(0, -4);
      result[key2] = {
        [`$${key.slice(-3)}`]: where[key].map((id) => Types.ObjectId(id)),
      };
    } else if (key.slice(-3) === '_in' || key.slice(-3) === '_lt' || key.slice(-3) === '_gt') {
      result[key.slice(0, -3)] = { [`$${key.slice(-2)}`]: where[key] };
    } else if (key.slice(-4) === '_nin' || key.slice(-4) === '_lte' || key.slice(-4) === '_gte') {
      result[key.slice(0, -4)] = { [`$${key.slice(-3)}`]: where[key] };
    } else if (key === 'AND' || key === 'NOT' || key === 'NOR' || key === 'OR') {
      result[`$${key.toLowerCase()}`] = where[key].map((where2) =>
        composeWhereInput(where2, thingConfig),
      );
    } else if (idFields.includes(key)) {
      result[key] = Types.ObjectId(where[key]);
    } else {
      result[key] = where[key];
    }
  });
  return result;
};

export default composeWhereInput;
