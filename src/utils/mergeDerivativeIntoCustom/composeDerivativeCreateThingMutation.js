// @flow
import type { ActionSignatureMethods, DerivativeAttributes } from '../../flowTypes';

import composeDerivativeConfigByName from '../composeDerivativeConfigByName';

const composeDerivativeCreateThingMutation = ({
  allow,
  suffix,
}: DerivativeAttributes): ActionSignatureMethods => {
  return {
    name: `createThing${suffix}`,
    specificName: ({ name }) =>
      allow[name] && allow[name].includes('createThing') ? `create${name}${suffix}` : '',
    argNames: () => ['data'],
    argTypes: ({ name }) => [`${name}CreateInput!`],
    type: ({ name }) => `${name}${suffix}!`,
    config: (thingConfig, generalConfig) =>
      composeDerivativeConfigByName(suffix, thingConfig, generalConfig),
  };
};

export default composeDerivativeCreateThingMutation;
