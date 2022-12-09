// @flow

import type { DerivativeAttributes } from '../flowTypes';

// import only to get all standard action NAMES
import actionAttributes from '../types/actionAttributes';

type Result = { [derivativeName: string]: DerivativeAttributes };

const actionGenericNames = Object.keys(actionAttributes);

const composeDerivative = (derivativeAttributesArray: Array<DerivativeAttributes>): Result => {
  const derivativeKeys = derivativeAttributesArray.reduce((prev, item) => {
    const { suffix } = item;
    if (!suffix) {
      throw new TypeError('Derivative attributes must have suffix!');
    }
    if (prev.includes(suffix)) {
      throw new TypeError(`Unique derivative attributes suffix: "${suffix}" is used twice!`);
    }

    prev.push(suffix);

    return prev;
  }, []);

  // *** check derivativeFields correctness

  derivativeAttributesArray.forEach(({ allow, derivativeFields, suffix }) => {
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
              `Incorrect derivative suffix: "${entityDerivativeFields[fieldName]}" for derivativeField: "${fieldName}" for entityName: "${entityName}" in derivative: "${suffix}"`,
            );
          }
        });
      });
    }
  });

  // ***

  const result = derivativeAttributesArray.reduce((prev, rawItem) => {
    const { allow, suffix } = rawItem;

    const item = { ...rawItem };

    Object.keys(allow).forEach((entityName) => {
      allow[entityName].forEach((actionGenericName) => {
        // $FlowFixMe
        actionAttributes[actionGenericName].actionDerivativeUpdater?.(entityName, item);
      });
    });

    prev[suffix] = item; // eslint-disable-line no-param-reassign

    return prev;
  }, {});

  return result;
};

export default composeDerivative;
