// @flow
import type { ActionSignatureMethods, DerivativeAttributes } from '../../flowTypes';

import composeDerivativeConfigByName from '../composeDerivativeConfigByName';

const composeDerivativeThingQuery = ({
  allowedRootNames,
  suffix,
}: DerivativeAttributes): ActionSignatureMethods => {
  return {
    name: ({ name }) => (allowedRootNames.includes(name) ? `${name}${suffix}` : ''),
    argNames: () => ['whereOne'],
    argTypes: ({ name }) => [`${name}WhereOneInput`],
    type: ({ name }) => `${name}${suffix}!`,
    config: (thingConfig, generalConfig) =>
      composeDerivativeConfigByName(suffix, thingConfig, generalConfig),
  };
};

export default composeDerivativeThingQuery;
