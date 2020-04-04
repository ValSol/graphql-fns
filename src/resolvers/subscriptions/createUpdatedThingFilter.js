// @flow
import type { ThingConfig } from '../../flowTypes';

import composeWhereFields from './composeWhereFields';

type DeletedThingFilter = (payload: { [key: string]: Object }, args: Object) => boolean;

const createUpdatedThingFilter = (thingConfig: ThingConfig): DeletedThingFilter => {
  const { name } = thingConfig;
  const whereFields = composeWhereFields(thingConfig);

  const filter = (payload, args) => {
    const { where } = args;

    if (!where) return true;

    const { previousNode: thing } = payload[`updated${name}`];

    return (
      !where ||
      !Object.keys(where).some((key) => {
        if (where[key] === undefined) return false;
        if (thing[key] === undefined) return true;
        if (whereFields[key] === 'dateTimeFields') {
          return where[key].valueOf() !== thing[key].valueOf();
        }
        if (whereFields[key] === 'dateTimeFieldsArray') {
          return !where[key].map((item) => item.valueOf()).includes(thing[key].valueOf());
        }
        if (whereFields[key] === 'relationalFields' || whereFields[key] === 'duplexFields') {
          return where[key] !== thing[key].toString();
        }
        if (whereFields[key] === 'idArray') {
          return !where[key].includes(thing[key].toString());
        }
        if (whereFields[key].slice(-5) === 'Array') {
          return !where[key].includes(thing[key]);
        }
        return where[key] !== thing[key];
      })
    );
  };
  return filter;
};
export default createUpdatedThingFilter;
