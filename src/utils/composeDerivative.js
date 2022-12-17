// @flow

import type { DerivativeAttributes } from '../flowTypes';

// import only to get all standard action NAMES
import actionAttributes from '../types/actionAttributes';

type Result = { [derivativeName: string]: DerivativeAttributes };

const actionGenericNames = Object.keys(actionAttributes);

const composeDerivative = (derivativeAttributesArray: Array<DerivativeAttributes>): Result => {
  const derivativeKeys = derivativeAttributesArray.reduce((prev, item) => {
    const { derivativeKey } = item;
    if (!derivativeKey) {
      throw new TypeError('Derivative attributes must have derivativeKey!');
    }
    if (prev.includes(derivativeKey)) {
      throw new TypeError(
        `Unique derivative attributes derivativeKey: "${derivativeKey}" is used twice!`,
      );
    }

    prev.push(derivativeKey);

    return prev;
  }, []);

  // *** check derivativeFields correctness

  derivativeAttributesArray.forEach(({ allow, derivativeFields, derivativeKey }) => {
    Object.keys(allow).forEach((key) => {
      allow[key].forEach((actionGenericName) => {
        if (!actionGenericNames.includes(actionGenericName)) {
          throw new TypeError(`Incorrect action generic name: "${actionGenericName}"!`);
        }
      });
    });
    if (derivativeFields) {
      Object.keys(derivativeFields).forEach((entityName) => {
        const entityDerivativeFields = derivativeFields[entityName];

        Object.keys(entityDerivativeFields).forEach((fieldName) => {
          if (!derivativeKeys.includes(entityDerivativeFields[fieldName])) {
            throw new TypeError(
              `Incorrect derivative derivativeKey: "${entityDerivativeFields[fieldName]}" for derivativeField: "${fieldName}" for entityName: "${entityName}" in derivative: "${derivativeKey}"`,
            );
          }
        });
      });
    }
  });

  // ***

  const result = derivativeAttributesArray.reduce((prev, rawItem) => {
    const { allow, derivativeKey } = rawItem;

    const item = { ...rawItem };

    Object.keys(allow).forEach((entityName) => {
      allow[entityName].forEach((actionGenericName) => {
        // $FlowFixMe
        actionAttributes[actionGenericName].actionDerivativeUpdater?.(entityName, item);
      });
    });

    prev[derivativeKey] = item; // eslint-disable-line no-param-reassign

    return prev;
  }, {});

  return result;
};

export default composeDerivative;
