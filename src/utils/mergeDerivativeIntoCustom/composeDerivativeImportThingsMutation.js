// @flow

import pluralize from 'pluralize';

import type { ActionSignatureMethods, DerivativeAttributes } from '../../flowTypes';

import composeDerivativeConfigByName from '../composeDerivativeConfigByName';

const composeDerivativeImportThingsMutation = ({
  allow,
  suffix,
}: DerivativeAttributes): ActionSignatureMethods => {
  return {
    name: ({ name }) =>
      allow.importThings && allow.importThings.includes(name)
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
