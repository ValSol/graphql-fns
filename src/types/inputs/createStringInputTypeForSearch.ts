import type { InputCreator } from '../../tsTypes';

const createStringInputTypeForSearch: InputCreator = (entityConfig) => {
  const { textFields = [] } = entityConfig;

  const inputName = '';

  const inputDefinition = textFields.some(({ weight }) => weight) ? 'String' : '';

  return [inputName, inputDefinition, {}];
};

export default createStringInputTypeForSearch;
