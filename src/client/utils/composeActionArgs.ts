import type { ActionAttributes, EntityConfig, GeneralConfig } from '../../tsTypes';

import parseEntityName from '../../utils/parseEntityName';

const composeActionArgs = (
  prefix: string,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  actionAttributes: ActionAttributes,
  childArgs: {
    [argName: string]: string;
  },
): Array<string> | string => {
  const {
    actionAllowed,
    actionGeneralName,
    actionType,
    actionName,
    argNames,
    argTypes,
    actionReturnConfig,
    inputCreators,
  } = actionAttributes;
  const { name: configName } = entityConfig;
  const { allEntityConfigs } = generalConfig;

  const { root: rootName, descendantKey } = parseEntityName(entityConfig.name, generalConfig);

  const specificName = actionName(rootName, descendantKey);

  if (!actionAllowed(entityConfig)) {
    throw new TypeError(
      `Action "${actionGeneralName('descendantKey')}" is not allowed for "${configName}" entity!`,
    );
  }

  const toShow = inputCreators.map((imputCreator) => Boolean(imputCreator(entityConfig)[1]));

  const filteredArgNames = argNames.filter((foo, i) => toShow[i]);
  const filteredArgTypes = argTypes.filter((foo, i) => toShow[i]);

  const args1arr = filteredArgNames.map(
    (argName, i) => `$${argName}: ${filteredArgTypes[i](entityConfig)}`,
  );
  Object.keys(childArgs).forEach((argName) => {
    args1arr.push(`$${argName}: ${childArgs[argName]}`);
  });
  const args1 = args1arr.join(', ');

  const args2 = filteredArgNames.map((argName) => `${argName}: $${argName}`).join(', ');

  return actionReturnConfig(allEntityConfigs[rootName], generalConfig, descendantKey)
    ? [
        `${actionType.toLowerCase()} ${prefix}_${specificName}(${args1}) {`,
        `  ${specificName}(${args2}) {`,
      ]
    : [
        `${actionType.toLowerCase()} ${prefix}_${specificName}(${args1}) {
  ${specificName}(${args2})
}`,
      ];
};

export default composeActionArgs;
