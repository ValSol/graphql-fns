// @flow

import type { DerivativeAttributes } from '../../flowTypes';
import type { ChildQueries } from './flowTypes';

const childQueriesToDerivative = (
  childQueries: ChildQueries,
  derivativeAttributes: { [derivativeKey: string]: DerivativeAttributes },
): { [derivativeKey: string]: DerivativeAttributes } => {
  childQueries.forEach(({ actionName, baseAction, derivativeKey, entityName }) => {
    if (actionName === baseAction) return;

    if (!derivativeAttributes[derivativeKey]) {
      derivativeAttributes[derivativeKey] = { derivativeKey, allow: {} }; // eslint-disable-line no-param-reassign
    }

    if (!derivativeAttributes[derivativeKey].allow[entityName]) {
      derivativeAttributes[derivativeKey].allow[entityName] = []; // eslint-disable-line no-param-reassign
    }

    if (!derivativeAttributes[derivativeKey].allow[entityName].includes(baseAction)) {
      // $FlowFixMe
      derivativeAttributes[derivativeKey].allow[entityName].push(baseAction);
    }
  });

  return derivativeAttributes;
};

export default childQueriesToDerivative;
