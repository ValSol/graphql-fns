// @flow

import type { DerivativeInputs } from '../flowTypes';

type Arg = Array<DerivativeInputs>;

type Result = { [suffix: string]: DerivativeInputs };

const composeDerivativeInputs = (arg: Arg): Result =>
  arg.reduce((prev, item) => {
    const { suffix } = item;

    prev[suffix] = item; // eslint-disable-line no-param-reassign

    return prev;
  }, {});

export default composeDerivativeInputs;
