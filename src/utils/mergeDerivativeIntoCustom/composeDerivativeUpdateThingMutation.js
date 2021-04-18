// @flow
import type { ActionSignatureMethods, DerivativeAttributes } from '../../flowTypes';

import createThingReorderCreatedInputType from '../../types/inputs/createThingReorderCreatedInputType';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeArgs from './composeArgs';

const predicates = [() => true, () => true, createThingReorderCreatedInputType];

const argNames = [() => 'whereOne', () => 'data', () => 'positions'];

const argTypes = [
  (name) => `${name}WhereOneInput!`,
  (name) => `${name}UpdateInput!`,
  (name) => `${name}ReorderCreatedInput`,
];

const composeDerivativeUpdateThingMutation = ({
  allow,
  suffix,
}: DerivativeAttributes): ActionSignatureMethods => ({
  name: `updateThing${suffix}`,
  specificName: ({ name }) =>
    allow[name] && allow[name].includes('updateThing') ? `update${name}${suffix}` : '',
  argNames: composeArgs(argNames, predicates, suffix),
  argTypes: composeArgs(argTypes, predicates, suffix),
  type: ({ name }) => `${name}${suffix}!`,
  config: (thingConfig, generalConfig) =>
    composeDerivativeConfigByName(suffix, thingConfig, generalConfig),
});

export default composeDerivativeUpdateThingMutation;
