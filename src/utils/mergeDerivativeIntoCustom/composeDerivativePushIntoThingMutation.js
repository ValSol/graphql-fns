// @flow
import type { ActionSignatureMethods, DerivativeAttributes } from '../../flowTypes';

import createPushIntoThingInputType from '../../types/inputs/createPushIntoThingInputType';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeArgs from './composeArgs';

const predicates = [() => true, () => true];

const argNames = [() => 'whereOne', () => 'data'];

const argTypes = [(name) => `${name}WhereOneInput!`, (name) => `PushInto${name}Input!`];

const composeDerivativePushIntoThingMutation = ({
  allow,
  suffix,
}: DerivativeAttributes): ActionSignatureMethods => ({
  name: `pushIntoThing${suffix}`,
  specificName: (thingConfig, generalConfig) => {
    const { name } = thingConfig;
    if (!(allow[name] && allow[name].includes('pushIntoThing'))) return '';

    const derivativeConfig = composeDerivativeConfigByName(suffix, thingConfig, generalConfig);

    const pushInto = createPushIntoThingInputType(derivativeConfig);

    return pushInto ? `pushInto${name}${suffix}` : '';
  },
  argNames: composeArgs(argNames, predicates, suffix),
  argTypes: composeArgs(argTypes, predicates, suffix),
  type: ({ name }) => `${name}${suffix}!`,
  config: (thingConfig, generalConfig) =>
    composeDerivativeConfigByName(suffix, thingConfig, generalConfig),
});

export default composeDerivativePushIntoThingMutation;
