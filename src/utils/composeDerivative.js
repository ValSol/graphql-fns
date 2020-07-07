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

  return result;
};

export default composeDerivative;
