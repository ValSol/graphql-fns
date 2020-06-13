// @flow

import pluralize from 'pluralize';

import type { ActionSignatureMethods, DerivativeAttributes } from '../../flowTypes';

import composeDerivativeConfigByName from '../composeDerivativeConfigByName';

const composeDerivativeCreateManyThingsMutation = ({
  allow,
  suffix,
}: DerivativeAttributes): ActionSignatureMethods => {
  return {
    name: ({ name }) =>
      allow.createManyThings && allow.createManyThings.includes(name)
        ? `createMany${pluralize(name)}${suffix}`
        : '',
    argNames: () => ['data'],
    argTypes: ({ name }) => [`[${name}CreateInput!]!`],
    type: ({ name }) => `[${name}${suffix}!]!`,
    config: (thingConfig, generalConfig) =>
      composeDerivativeConfigByName(suffix, thingConfig, generalConfig),
  };
};

export default composeDerivativeCreateManyThingsMutation;
