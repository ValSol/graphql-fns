// @flow
import type { ActionSignatureMethods, DerivativeAttributes } from '../../flowTypes';

import composeDerivativeConfigByName from '../composeDerivativeConfigByName';

const composeDerivativePushIntoThingMutation = ({
  allow,
  suffix,
}: DerivativeAttributes): ActionSignatureMethods => {
  return {
    name: ({ name }) =>
      allow.pushIntoThing && allow.pushIntoThing.includes(name) ? `pushInto${name}${suffix}` : '',
    argNames: () => ['whereOne', 'data'],
    argTypes: ({ name }) => [`${name}WhereOneInput!`, `PushInto${name}Input!`],
    type: ({ name }) => `${name}${suffix}!`,
    config: (thingConfig, generalConfig) =>
      composeDerivativeConfigByName(suffix, thingConfig, generalConfig),
  };
};

export default composeDerivativePushIntoThingMutation;
