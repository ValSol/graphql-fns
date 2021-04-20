// @flow

import type { ActionSignatureMethods, DerivativeAttributes } from '../../flowTypes';

import createThingDistinctValuesOptionsInputType from '../../types/inputs/createThingDistinctValuesOptionsInputType';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeArgs from './composeArgs';

const predicates = [() => true, () => true];

const argNames = [() => 'where', () => 'options'];

const argTypes = [(name) => `${name}WhereInput`, (name) => `${name}DistinctValuesOptionsInput`];

const composeDerivativeThingDistinctValuesQuery = ({
  allow,
  suffix,
}: DerivativeAttributes): ActionSignatureMethods => ({
  name: `thingDistinctValues${suffix}`,
  specificName: (thingConfig, generalConfig) => {
    const { name } = thingConfig;
    if (!(allow[name] && allow[name].includes('thingDistinctValues'))) return '';

    const derivativeConfig = composeDerivativeConfigByName(suffix, thingConfig, generalConfig);

    const distinctValues = createThingDistinctValuesOptionsInputType(derivativeConfig);

    return distinctValues ? `${name}DistinctValues${suffix}` : '';
  },
  argNames: composeArgs(argNames, predicates, suffix),
  argTypes: composeArgs(argTypes, predicates, suffix),
  type: () => '[String!]!',
  config: () => null,
});

export default composeDerivativeThingDistinctValuesQuery;
