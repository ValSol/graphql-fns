// @flow

import type { DerivativeAttributes } from '../../flowTypes';
import type { ChildQueries } from './flowTypes';

const childQueriesToDerivative = (
  childQueries: ChildQueries,
  derivativeAttributes: { [suffix: string]: DerivativeAttributes },
): { [suffix: string]: DerivativeAttributes } => {
  childQueries.forEach(({ actionName, baseAction, suffix, thingName }) => {
    if (actionName === baseAction) return;

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
  });

  return derivativeAttributes;
};

export default childQueriesToDerivative;
