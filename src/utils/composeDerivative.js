// @flow

import type { DerivativeAttributes } from '../flowTypes';

// import only to get all standard action NAMES
import actionAttributes from '../types/actionAttributes';

type Result = { [derivativeName: string]: DerivativeAttributes };

const actionGenericNames = Object.keys(actionAttributes);

const composeDerivative = (derivativeAttributesArray: Array<DerivativeAttributes>): Result => {
  const result = derivativeAttributesArray.reduce((prev, item) => {
    const { suffix } = item;
    if (!suffix) {
      throw new TypeError('Derivative attributes must have suffix!');
    }
    if (prev[suffix]) {
      throw new TypeError(`Unique derivative attributes suffix: "${suffix}" is used twice!`);
    }

    prev[suffix] = item; // eslint-disable-line no-param-reassign

    return prev;
  }, {});

  // *** check derivativeFields correctness

  const derivativeKeys = Object.keys(result);

  derivativeAttributesArray.forEach(({ allow, derivativeFields, suffix }) => {
    Object.keys(allow).forEach((key) => {
      allow[key].forEach((actionGenericName) => {
        if (!actionGenericNames.includes(actionGenericName)) {
          throw new TypeError(`Incorrect action generic name: "${actionGenericName}"!`);
        }
      });
    });
    if (derivativeFields) {
      Object.keys(derivativeFields).forEach((thingName) => {
        const thingDerivativeFields = derivativeFields[thingName];

        Object.keys(thingDerivativeFields).forEach((fieldName) => {
          if (!derivativeKeys.includes(thingDerivativeFields[fieldName])) {
            throw new TypeError(
              `Incorrect derivative suffix: "${thingDerivativeFields[fieldName]}" for derivativeField: "${fieldName}" for thingName: "${thingName}" in derivative: "${suffix}"`,
            );
          }
        });
      });
    }
  });

  // ***

  return result;
};

export default composeDerivative;
