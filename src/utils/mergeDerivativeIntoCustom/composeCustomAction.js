// @flow

import type {
  ActionSignatureMethods,
  ActionAttributes,
  DerivativeAttributes,
} from '../../flowTypes';

import composeDerivativeConfigByName from '../composeDerivativeConfigByName';

const composeArgNames = (argNames, inputCreators, suffix) => (entityConfig, generalConfig) => {
  const derivativeConfig = composeDerivativeConfigByName(suffix, entityConfig, generalConfig);

  return argNames
    .map((argName) => argName)
    .filter((foo, i) => inputCreators[i](derivativeConfig)[1]);
};

const composeArgTypes = (argTypes, inputCreators, suffix) => (entityConfig, generalConfig) => {
  const derivativeConfig = composeDerivativeConfigByName(suffix, entityConfig, generalConfig);
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
    specificName: (entityConfig, generalConfig) => {
      const { name: baseEntityName } = entityConfig;
      if (!(allow[baseEntityName] && allow[baseEntityName].includes(actionGeneralName())))
        return '';

      const derivativeConfig = composeDerivativeConfigByName(suffix, entityConfig, generalConfig);

      return actionAllowed(derivativeConfig) ? actionName(baseEntityName, suffix) : '';
    },
    argNames: composeArgNames(argNames, inputCreators, suffix),
    argTypes: composeArgTypes(argTypes, inputCreators, suffix),
    type: actionReturnString(suffix),
    config: (entityConfig, generalConfig) =>
      actionReturnConfig
        ? composeDerivativeConfigByName(suffix, entityConfig, generalConfig)
        : null,
  };
};

export default composeCustomAction;
