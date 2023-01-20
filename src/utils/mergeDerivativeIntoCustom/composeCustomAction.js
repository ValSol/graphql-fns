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

const composeInvolvedEntityNames =
  (actionInvolvedEntityNames, involvedOutputDerivativeKeys, derivativeKey) => (entityConfig) => {
    const defaultInvolvedEntityNames = actionInvolvedEntityNames(entityConfig.name, derivativeKey);

    if (!involvedOutputDerivativeKeys?.[entityConfig.name]) {
      return defaultInvolvedEntityNames;
    }

    const { inputOutputEntity: inputEntity, ...rest } = defaultInvolvedEntityNames;

    const outputDerivativeKeys = involvedOutputDerivativeKeys[entityConfig.name];

    const outputEntityNames = Object.keys(outputDerivativeKeys).reduce((prev, outputEntityKey) => {
      prev[outputEntityKey] = `${entityConfig.name}${outputDerivativeKeys[outputEntityKey]}`; // eslint-disable-line no-param-reassign

      return prev;
    }, {});

    return { ...rest, ...outputEntityNames, inputEntity };
  };

const amendOutputDerivativeKey = (derivativeKey, entityConfig, involvedOutputDerivativeKeys) => {
  if (!involvedOutputDerivativeKeys?.[entityConfig.name]) {
    return derivativeKey;
  }

  const {
    [entityConfig.name]: { outputEntity: amendedDerivativeKey },
  } = involvedOutputDerivativeKeys;

  return amendedDerivativeKey;
};

const composeType =
  (actionReturnString, derivativeKey, involvedOutputDerivativeKeys) => (entityConfig) => {
    const amendedOutputDerivativeKey = amendOutputDerivativeKey(
      derivativeKey,
      entityConfig,
      involvedOutputDerivativeKeys,
    );

    return actionReturnString(entityConfig, amendedOutputDerivativeKey);
  };

const composeCustomAction = (
  { allow, derivativeKey, involvedOutputDerivativeKeys }: DerivativeAttributes,
  actionAttributes: ActionAttributes,
): ActionSignatureMethods => {
  const {
    actionAllowed,
    actionGeneralName,
    actionName,
    argNames,
    argTypes,
    inputCreators,
    actionInvolvedEntityNames,
    actionReturnString,
    actionReturnConfig,
  } = actionAttributes;
  const name = actionGeneralName(derivativeKey);

  return {
    name,
    specificName: (entityConfig, generalConfig) => {
      const { name: baseEntityName } = entityConfig;
      if (!(allow[baseEntityName] && allow[baseEntityName].includes(actionGeneralName(''))))
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

    involvedEntityNames: composeInvolvedEntityNames(
      actionInvolvedEntityNames,
      involvedOutputDerivativeKeys,
      derivativeKey,
    ),

    type: composeType(actionReturnString, derivativeKey, involvedOutputDerivativeKeys),

    config: (entityConfig, generalConfig) =>
      actionReturnConfig(
        entityConfig,
        generalConfig,
        amendOutputDerivativeKey(derivativeKey, entityConfig, involvedOutputDerivativeKeys),
      ),
  };
};

export default composeCustomAction;
