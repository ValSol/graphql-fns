// @flow

import type { DerivativeAttributes, GeneralConfig } from '../../flowTypes';
import type { ActionToParse, ParsedAction } from './flowTypes';

const actionToDerivative = (
  actionToParse: ActionToParse,
  parsedAction: ParsedAction,
  derivativeAttributes: { [suffix: string]: DerivativeAttributes },
  generalConfig: GeneralConfig,
): { [suffix: string]: DerivativeAttributes } => {
  const { actionName, entityName } = actionToParse;
  const { baseAction, creationType, suffix, entityConfig } = parsedAction;

  const { entityConfigs } = generalConfig;

  if (creationType !== 'derivative' && (!entityConfig || entityConfigs[entityConfig.name])) {
    return derivativeAttributes;
  }

  const returningThingName = entityConfig ? entityConfig.name.slice(0, -suffix.length) : entityName;

  if (!entityConfigs[returningThingName]) return derivativeAttributes;

  if (!derivativeAttributes[suffix]) {
    derivativeAttributes[suffix] = { suffix, allow: {} }; // eslint-disable-line no-param-reassign
  }

  if (!derivativeAttributes[suffix].allow[returningThingName]) {
    derivativeAttributes[suffix].allow[returningThingName] = []; // eslint-disable-line no-param-reassign
  }

  if (
    baseAction &&
    baseAction !== actionName &&
    !derivativeAttributes[suffix].allow[returningThingName].includes(baseAction)
  ) {
    // $FlowFixMe
    derivativeAttributes[suffix].allow[returningThingName].push(baseAction);
  }

  return derivativeAttributes;
};

export default actionToDerivative;
