// @flow

import type { ActionAttributes, ThingConfig } from '../../flowTypes';

const composeActionArgs = (
  prefix: string,
  thingConfig: ThingConfig,
  actionAttributes: ActionAttributes,
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
  const { name: configName } = thingConfig;

  const specificName = actionName(configName);

  if (!actionAllowed(thingConfig)) {
    throw new TypeError(
      `Action "${actionGeneralName('')}" is not allowed for "${configName}" thing!`,
    );
  }

  const toShow = inputCreators.map((imputCreator) => Boolean(imputCreator(thingConfig)[1]));

  const filteredArgNames = argNames.filter((foo, i) => toShow[i]);
  const filteredArgTypes = argTypes.filter((foo, i) => toShow[i]);

  const args1 = filteredArgNames
    .map((argName, i) => `$${argName}: ${filteredArgTypes[i](configName)}`)
    .join(', ');
  const args2 = filteredArgNames.map((argName) => `${argName}: $${argName}`).join(', ');

  return actionReturnConfig
    ? [`${actionType} ${prefix}_${specificName}(${args1}) {`, `  ${specificName}(${args2}) {`]
    : [
        `${actionType} ${prefix}_${specificName}(${args1}) {
  ${specificName}(${args2})
}`,
      ];
};

export default composeActionArgs;
