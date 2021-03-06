// @flow

import type { InputCreator } from '../../flowTypes';

const createPaginationInputType: InputCreator = (thingConfig) => {
  const inputName = 'PaginationInput';

  const inputDefinition = thingConfig.pagination
    ? `input PaginationInput {
  skip: Int
  first: Int
}`
    : '';

  return [inputName, inputDefinition, {}];
};

export default createPaginationInputType;
