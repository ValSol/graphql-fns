// @flow

import type { InputCreator } from '../../flowTypes';

const createFileWhereOneInputType: InputCreator = (thingConfig) => {
  const inputName = 'FileWhereOneInput';

  const inputDefinition = thingConfig.file
    ? `input FileWhereOneInput {
  id: ID
  hash: String
}`
    : '';

  return [inputName, inputDefinition, {}];
};

export default createFileWhereOneInputType;
