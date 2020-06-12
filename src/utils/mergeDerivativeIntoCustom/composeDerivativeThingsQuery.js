// @flow

import pluralize from 'pluralize';

import type { ActionSignatureMethods, DerivativeAttributes, ThingConfig } from '../../flowTypes';

import createThingNearInputType from '../../types/inputs/createThingNearInputType';
import createThingPaginationInputType from '../../types/inputs/createThingPaginationInputType';
import createThingSortInputType from '../../types/inputs/createThingSortInputType';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';

const aditionalInputs = (thingConfig: ThingConfig) => {
  const sort = createThingSortInputType(thingConfig);
  const pagination = createThingPaginationInputType(thingConfig);
  const near = createThingNearInputType(thingConfig);
  return { sort, pagination, near };
};

const composeDerivativeThingsQuery = ({
  allowedRootNames,
  suffix,
}: DerivativeAttributes): ActionSignatureMethods => ({
  name: ({ name }) => (allowedRootNames.includes(name) ? `${pluralize(name)}${suffix}` : ''),
  argNames: (thingConfig, generalConfig) => {
    const result = ['where'];

    const derivativeConfig = composeDerivativeConfigByName(suffix, thingConfig, generalConfig);

    const { sort, pagination, near } = aditionalInputs(derivativeConfig);
    if (sort) result.push('sort');
    if (pagination) result.push('pagination');
    if (near) result.push('near');

    return result;
  },
  argTypes: (thingConfig, generalConfig) => {
    const { name } = thingConfig;
    const result = [`${name}WhereInput`];

    const derivativeConfig = composeDerivativeConfigByName(suffix, thingConfig, generalConfig);

    const { sort, pagination, near } = aditionalInputs(derivativeConfig);
    if (sort) result.push(`${name}SortInput`);
    if (pagination) result.push(`${name}PaginationInput`);
    if (near) result.push(`${name}NearInput`);

    return result;
  },
  type: ({ name }) => `[${name}${suffix}!]!`,
  config: (thingConfig, generalConfig) =>
    composeDerivativeConfigByName(suffix, thingConfig, generalConfig),
});

export default composeDerivativeThingsQuery;
