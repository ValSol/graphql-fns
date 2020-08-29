// @flow

import pluralize from 'pluralize';

import type { ActionSignatureMethods, DerivativeAttributes, ThingConfig } from '../../flowTypes';

import createThingNearInputType from '../../types/inputs/createThingNearInputType';
import createThingPaginationInputType from '../../types/inputs/createThingPaginationInputType';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';

const aditionalInputs = (thingConfig: ThingConfig) => {
  const pagination = createThingPaginationInputType(thingConfig);
  const near = createThingNearInputType(thingConfig);
  return { pagination, near };
};

const composeDerivativeThingsQuery = ({
  allow,
  suffix,
}: DerivativeAttributes): ActionSignatureMethods => ({
  name: `things${suffix}`,
  specificName: ({ name }) =>
    allow[name] && allow[name].includes('things') ? `${pluralize(name)}${suffix}` : '',
  argNames: (thingConfig, generalConfig) => {
    const result = ['where', 'sort'];

    const derivativeConfig = composeDerivativeConfigByName(suffix, thingConfig, generalConfig);

    const { pagination, near } = aditionalInputs(derivativeConfig);
    if (pagination) result.push('pagination');
    if (near) result.push('near');

    return result;
  },
  argTypes: (thingConfig, generalConfig) => {
    const { name } = thingConfig;
    const result = [`${name}WhereInput`, `${name}SortInput`];

    const derivativeConfig = composeDerivativeConfigByName(suffix, thingConfig, generalConfig);

    const { pagination, near } = aditionalInputs(derivativeConfig);
    if (pagination) result.push(`${name}PaginationInput`);
    if (near) result.push(`${name}NearInput`);

    return result;
  },
  type: ({ name }) => `[${name}${suffix}!]!`,
  config: (thingConfig, generalConfig) =>
    composeDerivativeConfigByName(suffix, thingConfig, generalConfig),
});

export default composeDerivativeThingsQuery;
