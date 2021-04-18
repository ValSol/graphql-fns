// @flow

import type { ActionSignatureMethods, DerivativeAttributes } from '../../flowTypes';

import createThingNearInputType from '../../types/inputs/createThingNearInputType';
import composeArgs from './composeArgs';

const predicates = [
  () => true,
  createThingNearInputType,
  (thingConfig) =>
    thingConfig.textFields ? thingConfig.textFields.some(({ weight }) => weight) : false,
];

const argNames = [() => 'where', () => 'near', () => 'search'];

const argTypes = [(name) => `${name}WhereInput`, (name) => `${name}NearInput`, () => `String`];

const composeDerivativeThingCountQuery = ({
  allow,
  suffix,
}: DerivativeAttributes): ActionSignatureMethods => ({
  name: `thingCount${suffix}`,
  specificName: ({ name }) =>
    allow[name] && allow[name].includes('thingCount') ? `${name}Count${suffix}` : '',
  argNames: composeArgs(argNames, predicates, suffix),
  argTypes: composeArgs(argTypes, predicates, suffix),
  type: () => `Int!`,
  config: () => null,
});

export default composeDerivativeThingCountQuery;
