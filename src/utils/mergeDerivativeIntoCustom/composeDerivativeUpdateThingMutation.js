// @flow
import type { ActionSignatureMethods, DerivativeAttributes } from '../../flowTypes';

import composeDerivativeConfigByName from '../composeDerivativeConfigByName';

const composeDerivativeUpdateThingMutation = ({
  allow,
  suffix,
}: DerivativeAttributes): ActionSignatureMethods => {
  return {
    name: `updateThing${suffix}`,
    specificName: ({ name }) =>
      allow[name] && allow[name].includes('updateThing') ? `update${name}${suffix}` : '',
    argNames: () => ['whereOne', 'data'],
    argTypes: ({ name }) => [`${name}WhereOneInput!`, `${name}UpdateInput!`],
    type: ({ name }) => `${name}${suffix}!`,
    config: (thingConfig, generalConfig) =>
      composeDerivativeConfigByName(suffix, thingConfig, generalConfig),
  };
};

export default composeDerivativeUpdateThingMutation;
