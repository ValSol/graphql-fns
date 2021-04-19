// @flow
import type { ActionSignatureMethods, DerivativeAttributes } from '../../flowTypes';

import createThingReorderCreatedInputType from '../../types/inputs/createThingReorderCreatedInputType';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeArgs from './composeArgs';

const predicates = [() => true, createThingReorderCreatedInputType];

const argNames = [() => 'data', () => 'positions'];

const argTypes = [(name) => `${name}CreateInput!`, (name) => `${name}ReorderCreatedInput`];

const composeDerivativeCreateThingMutation = ({
  allow,
  suffix,
}: DerivativeAttributes): ActionSignatureMethods => ({
  name: `createThing${suffix}`,
  specificName: ({ name }) =>
    allow[name] && allow[name].includes('createThing') ? `create${name}${suffix}` : '',
  argNames: composeArgs(argNames, predicates, suffix),
  argTypes: composeArgs(argTypes, predicates, suffix),
  type: ({ name }) => `${name}${suffix}!`,
  config: (thingConfig, generalConfig) =>
    composeDerivativeConfigByName(suffix, thingConfig, generalConfig),
});

export default composeDerivativeCreateThingMutation;
