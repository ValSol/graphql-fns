// @flow

import type { InputCreator, EntityConfig } from '../flowTypes';

const createPushIntoEntityInputType = (
  entityConfig: EntityConfig,
  inputCreator: InputCreator,
): Array<string> => {
  const [, inputDefinition] = inputCreator(entityConfig);

  if (!inputDefinition) return [];

  const result = inputDefinition
    .split('\n')
    .slice(1, -1)
    .map((rawStr) => {
      const [str] = rawStr.split(':');
      return str.trim();
    });

  return result;
};

export default createPushIntoEntityInputType;
