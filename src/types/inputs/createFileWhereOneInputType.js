// @flow

import type { InputCreator } from '../../flowTypes';

const createFileWhereOneInputType: InputCreator = (entityConfig) => {
  const inputName = 'FileWhereOneInput';

  const inputDefinition =
    entityConfig.type === 'file'
      ? `input FileWhereOneInput {
  id: ID
  hash: String
}`
      : '';

  return [inputName, inputDefinition, {}];
};

export default createFileWhereOneInputType;
