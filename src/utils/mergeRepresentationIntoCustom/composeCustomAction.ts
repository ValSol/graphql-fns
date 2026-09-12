import type {
  ActionSignatureMethods,
  ActionAttributes,
  RepresentationAttributes,
  RepresentationAttributesActionName,
  EntityConfig,
  InputCreator,
  GeneralConfig,
} from '../../tsTypes';

import composeRepresentationConfigByName from '../composeRepresentationConfigByName';

const composeArgNames =
  (argNames: Array<string>, inputCreators: Array<InputCreator>, representationKey: string) =>
  (entityConfig: EntityConfig, generalConfig: GeneralConfig) => {
    const representationConfig = composeRepresentationConfigByName(
      representationKey,
      entityConfig,
      generalConfig,
    );

    return argNames
      .map((argName) => argName)
      .filter((foo, i) => inputCreators[i](representationConfig)[1]);
  };

const composeArgTypes =
  (
    argTypes: Array<(arg: EntityConfig) => string>,
    inputCreators: Array<InputCreator>,
    representationKey: string,
  ) =>
  (entityConfig: EntityConfig, generalConfig: GeneralConfig) => {
    const representationConfig = composeRepresentationConfigByName(
      representationKey,
      entityConfig,
      generalConfig,
    );

    return argTypes
      .map((argType) => argType(representationConfig))
      .filter((foo, i) => inputCreators[i](representationConfig)[1]);
  };

const composeInvolvedEntityNames =
  (
    actionInvolvedEntityNames: (
      name: string,
      representationKey?: string,
    ) => {
      [key: string]: string;
    },
    involvedOutputRepresentationKeys:
      | undefined
      | {
          [entityName: string]: {
            outputEntity: string;
          };
        },
    representationKey: string,
  ) =>
  (entityConfig: EntityConfig) => {
    const defaultInvolvedEntityNames = actionInvolvedEntityNames(
      entityConfig.name,
      representationKey,
    );

    if (!involvedOutputRepresentationKeys?.[entityConfig.name]) {
      return defaultInvolvedEntityNames;
    }

    const { inputOutputEntity: inputEntity, ...rest } = defaultInvolvedEntityNames;

    const outputRepresentationKeys = involvedOutputRepresentationKeys[entityConfig.name];

    const outputEntityNames = Object.keys(outputRepresentationKeys).reduce<Record<string, any>>(
      (prev, outputEntityKey) => {
        prev[outputEntityKey] = `${entityConfig.name}${outputRepresentationKeys[outputEntityKey]}`;

        return prev;
      },
      {},
    );

    return { ...rest, ...outputEntityNames, inputEntity };
  };

const amendOutputRepresentationKey = (
  representationKey: string,
  entityConfig: EntityConfig,
  involvedOutputRepresentationKeys:
    | undefined
    | {
        [entityName: string]: {
          outputEntity: string;
        };
      },
) => {
  if (!involvedOutputRepresentationKeys?.[entityConfig.name]) {
    return representationKey;
  }

  const {
    [entityConfig.name]: { outputEntity: amendedRepresentationKey },
  } = involvedOutputRepresentationKeys;

  return amendedRepresentationKey;
};

const composeType =
  (
    actionReturnString: (entityConfig: EntityConfig, representationKey: string) => string,
    representationKey: string,
    involvedOutputRepresentationKeys:
      | undefined
      | {
          [entityName: string]: {
            outputEntity: string;
          };
        },
  ) =>
  (entityConfig: EntityConfig) => {
    const amendedOutputRepresentationKey = amendOutputRepresentationKey(
      representationKey,
      entityConfig,
      involvedOutputRepresentationKeys,
    );

    return actionReturnString(entityConfig, amendedOutputRepresentationKey);
  };

const composeCustomAction = (
  { allow, representationKey, involvedOutputRepresentationKeys }: RepresentationAttributes,
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

  const name = actionGeneralName(representationKey);

  return {
    name,
    specificName: (entityConfig, generalConfig) => {
      const { name: baseEntityName } = entityConfig;
      if (
        !(
          allow[baseEntityName] &&
          allow[baseEntityName].includes(
            actionGeneralName('') as RepresentationAttributesActionName,
          )
        )
      )
        return '';

      const representationConfig = composeRepresentationConfigByName(
        representationKey,
        entityConfig,
        generalConfig,
      );

      return actionAllowed(representationConfig)
        ? actionName(baseEntityName, representationKey)
        : '';
    },

    argNames: composeArgNames(argNames, inputCreators, representationKey),
    argTypes: composeArgTypes(argTypes, inputCreators, representationKey),

    involvedEntityNames: composeInvolvedEntityNames(
      actionInvolvedEntityNames,
      involvedOutputRepresentationKeys,
      representationKey,
    ),

    type: composeType(actionReturnString, representationKey, involvedOutputRepresentationKeys),

    config: (entityConfig, generalConfig) =>
      actionReturnConfig(
        entityConfig,
        generalConfig,
        amendOutputRepresentationKey(
          representationKey,
          entityConfig,
          involvedOutputRepresentationKeys,
        ),
      ),
  };
};

export default composeCustomAction;
