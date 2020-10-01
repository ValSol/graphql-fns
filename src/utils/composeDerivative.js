// @flow

import type { DerivativeAttributes } from '../flowTypes';

type Result = { [derivativeName: string]: DerivativeAttributes };

const composeDerivative = (derivativeAttributesArray: Array<DerivativeAttributes>): Result => {
  const result = derivativeAttributesArray.reduce((prev, item) => {
    const { suffix } = item;
    if (!suffix) {
      throw TypeError('Derivative attributes must have suffix!');
    }
    if (prev[suffix]) {
      throw TypeError(`Unique derivative attributes suffix: "${suffix}" is used twice!`);
    }

    prev[suffix] = item; // eslint-disable-line no-param-reassign

    return prev;
  }, {});

  // *** check derivativeFields correctness

  const derivativeKeys = Object.keys(result);

  derivativeAttributesArray.forEach(({ derivativeFields, suffix }) => {
    if (derivativeFields) {
      Object.keys(derivativeFields).forEach((thingName) => {
        const thingDerivativeFields = derivativeFields[thingName];
        Object.keys(thingDerivativeFields).forEach((fieldName) => {
          if (!derivativeKeys.includes(thingDerivativeFields[fieldName])) {
            throw TypeError(
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