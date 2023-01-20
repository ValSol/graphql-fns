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
    const { derivativeKey } = rawItem;

    const item = { ...rawItem };

    prev[derivativeKey] = item; // eslint-disable-line no-param-reassign

    return prev;
  }, {});

  Object.keys(result).forEach((derivativeKey) => {
    const { allow, involvedOutputDerivativeKeys = {} } = result[derivativeKey];

    Object.keys(allow).forEach((entityName) => {
      const derivativeKey2 =
        involvedOutputDerivativeKeys?.[entityName]?.outputEntity || derivativeKey;

      if (derivativeKey2 === derivativeKey && involvedOutputDerivativeKeys?.[entityName]) {
        throw new TypeError(
          `involvedOutputDerivativeKeys attribute of derivative "${derivativeKey}" has an incorrect keys: "${JSON.stringify(
            involvedOutputDerivativeKeys?.[entityName],
          )}"!`,
        );
      }

      const item = result[derivativeKey2];

      if (!item) {
        throw new TypeError(
          `Incorrect derivativeKey: "${derivativeKey2}" for involvedOutputDerivativeKeys in derivative "${derivativeKey}"!`,
        );
      }

      allow[entityName].forEach((actionGenericName) => {
        // $FlowFixMe
        actionAttributes[actionGenericName].actionDerivativeUpdater?.(entityName, item);
      });
    });
  }, {});

  return result;
};

export default composeDerivative;
