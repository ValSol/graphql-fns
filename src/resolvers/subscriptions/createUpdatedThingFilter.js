// @flow
import type { ThingConfig } from '../../flowTypes';

import composeWhereFields from './composeWhereFields';
import composeWhereOneFields from './composeWhereOneFields';

type DeletedThingFilter = (payload: { [key: string]: Object }, args: Object) => boolean;

const createUpdatedThingFilter = (thingConfig: ThingConfig): DeletedThingFilter => {
  const { name } = thingConfig;
  const whereFields = composeWhereFields(thingConfig);
  const whereOneFields = composeWhereOneFields(thingConfig);

  const filter = (payload, args) => {
    const { where, whereOne } = args;

    if (!where && !whereOne) return true;

    const { previousNode: thing } = payload[`updated${name}`];

    const whereResult =
      !where ||
      !Object.keys(where).some(key => {
        if (where[key] === undefined) return false;
        if (thing[key] === undefined) return true;
        if (whereFields[key] === 'dateTimeFields') {
          return where[key].valueOf() !== thing[key].valueOf();
        }
        if (whereFields[key] === 'relationalFields' || whereFields[key] === 'duplexFields') {
          return where[key] !== thing[key].toString();
        }
        return where[key] !== thing[key];
      });

    if (!whereResult) return false;

    return (
      !whereOne ||
      !Object.keys(whereOneFields).some(key => {
        if (whereOne[key] === undefined) return false;
        if (key === 'id') {
          return whereOne[key] !== thing[key].toString();
        }
        if (thing[key] === undefined) return true;
        if (whereOneFields[key] === 'dateTimeFields') {
          return whereOne[key].valueOf() !== thing[key].valueOf();
        }
        return whereOne[key] !== thing[key];
      })
    );
  };

  return filter;
};

export default createUpdatedThingFilter;
