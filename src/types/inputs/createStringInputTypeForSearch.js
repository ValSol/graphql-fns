// @flow

import type { InputCreator } from '../../flowTypes';

const createStringInputTypeForSearch: InputCreator = (thingConfig) => {
  const { textFields } = thingConfig;

  const inputName = '';

  const inputDefinition = (textFields || []).some(({ weight }) => weight) ? 'String' : '';

  return [inputName, inputDefinition, {}];
};

export default createStringInputTypeForSearch;
