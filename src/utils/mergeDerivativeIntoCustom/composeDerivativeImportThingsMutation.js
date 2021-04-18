// @flow

import pluralize from 'pluralize';

import type { ActionSignatureMethods, DerivativeAttributes } from '../../flowTypes';

import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeArgs from './composeArgs';

const predicates = [() => true, () => true];

const argNames = [() => 'file', () => 'options'];

const argTypes = [() => 'Upload!', () => 'ImportOptionsInput'];

const composeDerivativeImportThingsMutation = ({
  allow,
  suffix,
}: DerivativeAttributes): ActionSignatureMethods => ({
  name: `importThings${suffix}`,
  specificName: ({ name }) =>
    allow[name] && allow[name].includes('importThings') ? `import${pluralize(name)}${suffix}` : '',
  argNames: composeArgs(argNames, predicates, suffix),
  argTypes: composeArgs(argTypes, predicates, suffix),
  type: ({ name }) => `[${name}${suffix}!]!`,
  config: (thingConfig, generalConfig) =>
    composeDerivativeConfigByName(suffix, thingConfig, generalConfig),
});

export default composeDerivativeImportThingsMutation;
