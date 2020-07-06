// @flow

import pluralize from 'pluralize';

import type { ActionSignatureMethods, DerivativeAttributes } from '../../flowTypes';

import composeDerivativeConfigByName from '../composeDerivativeConfigByName';

const composeDerivativeImportThingsMutation = ({
  allow,
  suffix,
}: DerivativeAttributes): ActionSignatureMethods => {
  return {
    name: `importThings${suffix}`,
    specificName: ({ name }) =>
      allow[name] && allow[name].includes('importThings')
        ? `import${pluralize(name)}${suffix}`
        : '',
    argNames: () => ['file', 'options'],
    argTypes: () => ['Upload!', 'ImportOptionsInput'],
    type: ({ name }) => `[${name}${suffix}!]!`,
    config: (thingConfig, generalConfig) =>
      composeDerivativeConfigByName(suffix, thingConfig, generalConfig),
  };
};

export default composeDerivativeImportThingsMutation;
