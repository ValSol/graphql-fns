import type { EntityConfig, InputCreator } from '@/tsTypes';

import createEntityRestrictedWhereInputType from './createEntityRestrictedWhereInputType';
import createEntityTextNamesEnumType from './createEntityTextNamesEnumType';

// item of "XManyDistinctValues": "target" as in "XDistinctValuesOptionsInput" ...
// ... and optional "where" without relational filters "x_" (as items of "XCounts")
const createEntityRestrictedWhereAndTargetInputType: InputCreator = (entityConfig) => {
  const { name } = entityConfig;

  const inputName = `${name}RestrictedWhereAndTargetInput`;

  const [enumName, enumDefinition] = createEntityTextNamesEnumType(entityConfig);

  if (!enumDefinition) return [inputName, '', {}];

  const inputDefinition = `input ${inputName} {
  target: ${enumName}!
  where: ${name}RestrictedWhereInput
}`;

  const childChain: Record<string, [InputCreator, EntityConfig]> = {
    [enumName]: [createEntityTextNamesEnumType, entityConfig],
    [`${name}RestrictedWhereInput`]: [createEntityRestrictedWhereInputType, entityConfig],
  };

  return [inputName, inputDefinition, childChain];
};

export default createEntityRestrictedWhereAndTargetInputType;
