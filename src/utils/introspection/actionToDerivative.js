// @flow

import type { DerivativeAttributes } from '../../flowTypes';
import type { ActionToParse, ParsedAction } from './flowTypes';

const actionToDerivative = (
  actionToParse: ActionToParse,
  parsedAction: ParsedAction,
  derivativeAttributes: { [suffix: string]: DerivativeAttributes },
): { [suffix: string]: DerivativeAttributes } => {
  const { thingName } = actionToParse;
  const { baseAction, creationType, suffix } = parsedAction;

  if (creationType !== 'derivative') return derivativeAttributes;

  if (!derivativeAttributes[suffix]) {
    derivativeAttributes[suffix] = { suffix, allow: {} }; // eslint-disable-line no-param-reassign
  }

  if (!derivativeAttributes[suffix].allow[thingName]) {
    derivativeAttributes[suffix].allow[thingName] = []; // eslint-disable-line no-param-reassign
  }

  if (!derivativeAttributes[suffix].allow[thingName].includes(baseAction)) {
    // $FlowFixMe
    derivativeAttributes[suffix].allow[thingName].push(baseAction);
  }

  return derivativeAttributes;
};

export default actionToDerivative;
