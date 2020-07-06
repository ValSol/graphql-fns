// @flow
import type { ActionSignatureMethods, DerivativeAttributes } from '../../flowTypes';

import composeDerivativeConfigByName from '../composeDerivativeConfigByName';

const composeDerivativeThingQuery = ({
  allow,
  suffix,
}: DerivativeAttributes): ActionSignatureMethods => {
  return {
    name: `thing${suffix}`,
    specificName: ({ name }) =>
      allow[name] && allow[name].includes('thing') ? `${name}${suffix}` : '',
    argNames: () => ['whereOne'],
    argTypes: ({ name }) => [`${name}WhereOneInput`],
    type: ({ name }) => `${name}${suffix}!`,
    config: (thingConfig, generalConfig) =>
      composeDerivativeConfigByName(suffix, thingConfig, generalConfig),
  };
};

export default composeDerivativeThingQuery;
