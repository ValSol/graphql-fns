// @flow

import type {
  ActionSignatureMethods,
  ActionAttributes,
  DerivativeAttributes,
} from '../../flowTypes';

import composeDerivativeConfigByName from '../composeDerivativeConfigByName';

const composeArgNames =
  (argNames, inputCreators, derivativeKey) => (entityConfig, generalConfig) => {
    const derivativeConfig = composeDerivativeConfigByName(
      derivativeKey,
      entityConfig,
      generalConfig,
    );

    return argNames
      .map((argName) => argName)
      .filter((foo, i) => inputCreators[i](derivativeConfig)[1]);
  };

const composeArgTypes =
  (argTypes, inputCreators, derivativeKey) => (entityConfig, generalConfig) => {
    const derivativeConfig = composeDerivativeConfigByName(
      derivativeKey,
      entityConfig,
      generalConfig,
    );
    const { name } = derivativeConfig;

    return argTypes
      .map((argType) => argType(name))
      .filter((foo, i) => inputCreators[i](derivativeConfig)[1]);
  };

const composeCustomAction = (
  { allow, derivativeKey }: DerivativeAttributes,
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
  const name = actionGeneralName(derivativeKey);
  return {
    name,
    specificName: (entityConfig, generalConfig) => {
      const { name: baseEntityName } = entityConfig;
      if (!(allow[baseEntityName] && allow[baseEntityName].includes(actionGeneralName())))
        return '';

      const derivativeConfig = composeDerivativeConfigByName(
        derivativeKey,
        entityConfig,
        generalConfig,
      );

      return actionAllowed(derivativeConfig) ? actionName(baseEntityName, derivativeKey) : '';
    },
    argNames: composeArgNames(argNames, inputCreators, derivativeKey),
    argTypes: composeArgTypes(argTypes, inputCreators, derivativeKey),
    type: actionReturnString(derivativeKey),
    config: (entityConfig, generalConfig) =>
      actionReturnConfig(entityConfig, generalConfig, derivativeKey),
  };
};

export default composeCustomAction;
