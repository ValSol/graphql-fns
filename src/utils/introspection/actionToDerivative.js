// @flow

import type { DerivativeAttributes, GeneralConfig } from '../../flowTypes';
import type { ActionToParse, ParsedAction } from './flowTypes';

const actionToDerivative = (
  actionToParse: ActionToParse,
  parsedAction: ParsedAction,
  derivativeAttributes: { [derivativeKey: string]: DerivativeAttributes },
  generalConfig: GeneralConfig,
): { [derivativeKey: string]: DerivativeAttributes } => {
  const { actionName, entityName } = actionToParse;
  const { baseAction, creationType, derivativeKey, entityConfig } = parsedAction;

  const { allEntityConfigs } = generalConfig;

  if (creationType !== 'derivative' && (!entityConfig || allEntityConfigs[entityConfig.name])) {
    return derivativeAttributes;
  }

  const returningThingName = entityConfig
    ? entityConfig.name.slice(0, -derivativeKey.length)
    : entityName;

  if (!allEntityConfigs[returningThingName]) return derivativeAttributes;

  if (!derivativeAttributes[derivativeKey]) {
    derivativeAttributes[derivativeKey] = { derivativeKey, allow: {} }; // eslint-disable-line no-param-reassign
  }

  if (!derivativeAttributes[derivativeKey].allow[returningThingName]) {
    derivativeAttributes[derivativeKey].allow[returningThingName] = []; // eslint-disable-line no-param-reassign
  }

  if (
    baseAction &&
    baseAction !== actionName &&
    !derivativeAttributes[derivativeKey].allow[returningThingName].includes(baseAction)
  ) {
    // $FlowFixMe
    derivativeAttributes[derivativeKey].allow[returningThingName].push(baseAction);
  }

  return derivativeAttributes;
};

export default actionToDerivative;
