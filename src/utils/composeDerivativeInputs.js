// @flow

import type { DerivativeInputs } from '../flowTypes';

type Arg = Array<DerivativeInputs>;

type Result = { [derivativeKey: string]: DerivativeInputs };

const composeDerivativeInputs = (arg: Arg): Result =>
  arg.reduce((prev, item) => {
    const { derivativeKey } = item;

    prev[derivativeKey] = item; // eslint-disable-line no-param-reassign

    return prev;
  }, {});

export default composeDerivativeInputs;
