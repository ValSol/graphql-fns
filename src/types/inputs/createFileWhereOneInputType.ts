import type {InputCreator} from '../../tsTypes';

const createFileWhereOneInputType: InputCreator = (entityConfig) => {
  const inputName = 'FileWhereOneInput';

  const inputDefinition =
    entityConfig.type === 'tangibleFile'
      ? `input FileWhereOneInput {
  id: ID
  hash: String
}`
      : '';

  return [inputName, inputDefinition, {}];
};

export default createFileWhereOneInputType;
