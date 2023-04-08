import type { DerivativeAttributes, DerivativeAttributesActionName } from '../../tsTypes';
import type { ChildQueries } from './tsTypes';

const childQueriesToDerivative = (
  childQueries: ChildQueries,
  derivativeAttributes: {
    [derivativeKey: string]: DerivativeAttributes;
  },
): {
  [derivativeKey: string]: DerivativeAttributes;
} => {
  childQueries.forEach(({ actionName, baseAction, derivativeKey, entityName }) => {
    if (actionName === baseAction) return;

    if (!derivativeAttributes[derivativeKey]) {
      derivativeAttributes[derivativeKey] = { derivativeKey, allow: {} }; // eslint-disable-line no-param-reassign
    }

    if (!derivativeAttributes[derivativeKey].allow[entityName]) {
      derivativeAttributes[derivativeKey].allow[entityName] = []; // eslint-disable-line no-param-reassign
    }

    if (
      !derivativeAttributes[derivativeKey].allow[entityName].includes(
        baseAction as DerivativeAttributesActionName,
      )
    ) {
      derivativeAttributes[derivativeKey].allow[entityName].push(
        baseAction as DerivativeAttributesActionName,
      );
    }
  });

  return derivativeAttributes;
};

export default childQueriesToDerivative;
