// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingPaginationInputType = (thingConfig: ThingConfig): string => {
  const { name, pagination } = thingConfig;

  if (pagination) {
    return `input ${name}PaginationInput {
  skip: Int
  first: Int
}`;
  }

  return '';
};

export default createThingPaginationInputType;
