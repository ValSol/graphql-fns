// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingPaginationInputType = (thingConfig: ThingConfig): string => {
  const { name, pagination } = thingConfig;

  if (pagination) {
    const { skip, first } = pagination;
    return `
input ${name}PaginationInput {
  skip: Int = ${skip}
  first: Int = ${first}
}`;
  }

  return '';
};

module.exports = createThingPaginationInputType;
