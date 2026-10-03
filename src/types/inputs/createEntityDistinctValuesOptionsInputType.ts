import type { EntityConfig, InputCreator } from '@/tsTypes';

import createEntityTextNamesEnumType from './createEntityTextNamesEnumType';

const createEntityDistinctValuesOptionsInputType: InputCreator = (entityConfig) => {
  const { name } = entityConfig;

  const inputName = `${name}DistinctValuesOptionsInput`;

  const [enumName, enumDefinition] = createEntityTextNamesEnumType(entityConfig);

  const inputDefinition = enumDefinition
    ? `input ${inputName} {
  target: ${enumName}!
}`
    : '';

  const childChain: Record<string, [InputCreator, EntityConfig]> = enumDefinition
    ? { [enumName]: [createEntityTextNamesEnumType, entityConfig] }
    : {};

  return [inputName, inputDefinition, childChain];
};

export default createEntityDistinctValuesOptionsInputType;
