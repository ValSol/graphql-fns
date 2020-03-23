// @flow
import type { ThingConfig } from '../../flowTypes';

import composeWhereFields from './composeWhereFields';

type СreatedThingFilter = (payload: { [key: string]: Object }, args: Object) => boolean;

const createСreatedThingFilter = (thingConfig: ThingConfig): СreatedThingFilter => {
  const { name } = thingConfig;
  const whereFields = composeWhereFields(thingConfig);

  const filter = (payload, args) => {
    const { where } = args;

    if (!where) return true;

    const thing = payload[`created${name}`];

    // the same code as in createDeletedThingFilter.js
    return !Object.keys(where).some((key) => {
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

export default createСreatedThingFilter;
