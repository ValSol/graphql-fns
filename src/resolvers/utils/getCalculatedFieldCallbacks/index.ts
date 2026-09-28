import type {
  CalculatedFieldCallbacks,
  EntityConfig,
  GeneralConfig,
  ServersideConfig,
} from '@/tsTypes';

import parseEntityName from '@/utils/parseEntityName';

// callbacks are looked up by the entity config name first: a representation config can add its own
// calculated fields ("addFields"), and then by the root entity name for the fields copied from it
const getCalculatedFieldCallbacks = (
  entityConfig: EntityConfig,
  fieldName: string,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig = {},
): CalculatedFieldCallbacks => {
  const { calculatedFields = {} } = serversideConfig;
  const { name } = entityConfig;

  const ownCallbacks = calculatedFields[name]?.[fieldName];

  if (ownCallbacks) return ownCallbacks;

  const { root } = parseEntityName(name, generalConfig);

  const rootCallbacks = root === name ? undefined : calculatedFields[root]?.[fieldName];

  if (rootCallbacks) return rootCallbacks;

  throw new TypeError(
    `Not found callbacks of calculated field "${fieldName}" of entity "${name}" in "serversideConfig.calculatedFields"!`,
  );
};

export default getCalculatedFieldCallbacks;
