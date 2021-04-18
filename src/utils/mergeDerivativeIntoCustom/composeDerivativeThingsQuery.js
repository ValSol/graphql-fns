// @flow

import pluralize from 'pluralize';

import type { ActionSignatureMethods, DerivativeAttributes } from '../../flowTypes';

import createThingNearInputType from '../../types/inputs/createThingNearInputType';
import createThingPaginationInputType from '../../types/inputs/createThingPaginationInputType';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeArgs from './composeArgs';

const predicates = [
  () => true,
  () => true,
  createThingPaginationInputType,
  createThingNearInputType,
  (thingConfig) =>
    thingConfig.textFields ? thingConfig.textFields.some(({ weight }) => weight) : false,
];

const argNames = [() => 'where', () => 'sort', () => 'pagination', () => 'near', () => 'search'];

const argTypes = [
  (name) => `${name}WhereInput`,
  (name) => `${name}SortInput`,
  (name) => `${name}PaginationInput`,
  (name) => `${name}NearInput`,
  () => 'String',
];

const composeDerivativeThingsQuery = ({
  allow,
  suffix,
}: DerivativeAttributes): ActionSignatureMethods => ({
  name: `things${suffix}`,
  specificName: ({ name }) =>
    allow[name] && allow[name].includes('things') ? `${pluralize(name)}${suffix}` : '',
  argNames: composeArgs(argNames, predicates, suffix),
  argTypes: composeArgs(argTypes, predicates, suffix),
  type: ({ name }) => `[${name}${suffix}!]!`,
  config: (thingConfig, generalConfig) =>
    composeDerivativeConfigByName(suffix, thingConfig, generalConfig),
});

export default composeDerivativeThingsQuery;
