// @flow
import type { EntityConfig } from '../../../flowTypes';

import composeWhereFields from '../composeWhereFields';

type DeletedEntityFilter = (payload: { [key: string]: Object }, args: Object) => boolean;

const createUpdatedEntityFilter = (entityConfig: EntityConfig): DeletedEntityFilter => {
  const { name } = entityConfig;
  const whereFields = composeWhereFields(entityConfig);

  const filter = (payload, args) => {
    const { where } = args;

    if (!where) return true;

    const { previousNode: entity } = payload[`updated${name}`];

    return (
      !where ||
      !Object.keys(where).some((key) => {
        if (where[key] === undefined) return false;
        if (entity[key] === undefined) return true;
        if (whereFields[key] === 'dateTimeFields') {
          return where[key].valueOf() !== entity[key].valueOf();
        }
        if (whereFields[key] === 'dateTimeFieldsArray') {
          return !where[key].map((item) => item.valueOf()).includes(entity[key].valueOf());
        }
        if (whereFields[key] === 'relationalFields' || whereFields[key] === 'duplexFields') {
          return where[key] !== entity[key].toString();
        }
        if (whereFields[key] === 'idArray') {
          return !where[key].includes(entity[key].toString());
        }
        if (whereFields[key].slice(-5) === 'Array') {
          return !where[key].includes(entity[key]);
        }
        return where[key] !== entity[key];
      })
    );
  };
  return filter;
};
export default createUpdatedEntityFilter;
