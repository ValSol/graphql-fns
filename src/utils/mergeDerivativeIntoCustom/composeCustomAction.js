// @flow

import type {
  ActionSignatureMethods,
  ActionAttributes,
  DerivativeAttributes,
} from '../../flowTypes';

import composeDerivativeConfigByName from '../composeDerivativeConfigByName';

const composeArgNames = (argNames, inputCreators, suffix) => (thingConfig, generalConfig) => {
  const derivativeConfig = composeDerivativeConfigByName(suffix, thingConfig, generalConfig);

  return argNames
    .map((argName) => argName)
    .filter((foo, i) => inputCreators[i](derivativeConfig)[1]);
};

const composeArgTypes = (argTypes, inputCreators, suffix) => (thingConfig, generalConfig) => {
  const derivativeConfig = composeDerivativeConfigByName(suffix, thingConfig, generalConfig);
  const { name } = derivativeConfig;

  return argTypes
    .map((argType) => argType(name))
    .filter((foo, i) => inputCreators[i](derivativeConfig)[1]);
};

const composeCustomAction = (
  { allow, suffix }: DerivativeAttributes,
  actionAttributes: ActionAttributes,
): ActionSignatureMethods => {
  const {
    actionAllowed,
    actionGeneralName,
    actionName,
    argNames,
    argTypes,
    inputCreators,
    actionReturnString,
    actionReturnConfig,
  } = actionAttributes;
  const name = actionGeneralName(suffix);
  return {
    name,
    specificName: (thingConfig, generalConfig) => {
      const { name: baseThingName } = thingConfig;
      if (!(allow[baseThingName] && allow[baseThingName].includes(actionGeneralName()))) return '';

      const derivativeConfig = composeDerivativeConfigByName(suffix, thingConfig, generalConfig);

      return actionAllowed(derivativeConfig) ? actionName(baseThingName, suffix) : '';
    },
    argNames: composeArgNames(argNames, inputCreators, suffix),
    argTypes: composeArgTypes(argTypes, inputCreators, suffix),
    type: actionReturnString(suffix),
    config: (thingConfig, generalConfig) =>
      actionReturnConfig ? composeDerivativeConfigByName(suffix, thingConfig, generalConfig) : null,
  };
};

export default composeCustomAction;
