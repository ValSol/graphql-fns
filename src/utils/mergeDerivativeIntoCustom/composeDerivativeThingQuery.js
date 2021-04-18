// @flow
import type { ActionSignatureMethods, DerivativeAttributes } from '../../flowTypes';

import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeArgs from './composeArgs';

const predicates = [() => true];

const argNames = [() => 'whereOne'];

const argTypes = [(name) => `${name}WhereOneInput!`];

const composeDerivativeThingQuery = ({
  allow,
  suffix,
}: DerivativeAttributes): ActionSignatureMethods => ({
  name: `thing${suffix}`,
  specificName: ({ name }) =>
    allow[name] && allow[name].includes('thing') ? `${name}${suffix}` : '',
  argNames: composeArgs(argNames, predicates, suffix),
  argTypes: composeArgs(argTypes, predicates, suffix),
  type: ({ name }) => `${name}${suffix}`,
  config: (thingConfig, generalConfig) =>
    composeDerivativeConfigByName(suffix, thingConfig, generalConfig),
});

export default composeDerivativeThingQuery;
