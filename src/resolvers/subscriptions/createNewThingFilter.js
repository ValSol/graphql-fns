// @flow
import type { ThingConfig } from '../../flowTypes';

const composeWhereFields = require('./composeWhereFields');

type NewThingFilter = (payload: { [key: string]: Object }, args: Object) => boolean;

const createNewThingFilter = (thingConfig: ThingConfig): NewThingFilter => {
  const { name } = thingConfig;
  const whereFields = composeWhereFields(thingConfig);

  const filter = (payload, args) => {
    const { where } = args;

    if (!where) return true;

    const thing = payload[`new${name}`];

    return !Object.keys(where).some(key => {
      if (!where[key] === undefined) return false;
      if (thing[key] === undefined) return true;
      if (whereFields[key] === 'dateTimeFields') {
        return where[key].valueOf() !== thing[key].valueOf();
      }
      if (whereFields[key] === 'relationalFields' || whereFields[key] === 'duplexFields') {
        return where[key] !== thing[key].toString();
      }
      return where[key] !== thing[key];
    });
  };

  return filter;
};

module.exports = createNewThingFilter;