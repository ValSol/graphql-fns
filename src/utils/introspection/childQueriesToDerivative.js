// @flow

import type { DerivativeAttributes } from '../../flowTypes';
import type { ChildQueries } from './flowTypes';

const childQueriesToDerivative = (
  childQueries: ChildQueries,
  derivativeAttributes: { [suffix: string]: DerivativeAttributes },
): { [suffix: string]: DerivativeAttributes } => {
  childQueries.forEach(({ actionName, baseAction, suffix, entityName }) => {
    if (actionName === baseAction) return;

    if (!derivativeAttributes[suffix]) {
      derivativeAttributes[suffix] = { suffix, allow: {} }; // eslint-disable-line no-param-reassign
    }

    if (!derivativeAttributes[suffix].allow[entityName]) {
      derivativeAttributes[suffix].allow[entityName] = []; // eslint-disable-line no-param-reassign
    }

    if (!derivativeAttributes[suffix].allow[entityName].includes(baseAction)) {
      // $FlowFixMe
      derivativeAttributes[suffix].allow[entityName].push(baseAction);
    }
  });

  return derivativeAttributes;
};

export default childQueriesToDerivative;
