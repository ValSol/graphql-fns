import type {
  ActionSignatureMethods,
  ActionAttributes,
  DescendantAttributes,
  DescendantAttributesActionName,
  EntityConfig,
  InputCreator,
  GeneralConfig,
} from '../../tsTypes';

import composeDescendantConfigByName from '../composeDescendantConfigByName';

const composeArgNames =
  (argNames: Array<string>, inputCreators: Array<InputCreator>, descendantKey: string) =>
  (entityConfig: EntityConfig, generalConfig: GeneralConfig) => {
    const descendantConfig = composeDescendantConfigByName(
      descendantKey,
      entityConfig,
      generalConfig,
    );

    return argNames
      .map((argName) => argName)
      .filter((foo, i) => inputCreators[i](descendantConfig)[1]);
  };

const composeArgTypes =
  (
    argTypes: Array<(name: string) => string>,
    inputCreators: Array<InputCreator>,
    descendantKey: string,
  ) =>
  (entityConfig: EntityConfig, generalConfig: GeneralConfig) => {
    const descendantConfig = composeDescendantConfigByName(
      descendantKey,
      entityConfig,
      generalConfig,
    );
    const { name } = descendantConfig;

    return argTypes
      .map((argType) => argType(name))
      .filter((foo, i) => inputCreators[i](descendantConfig)[1]);
  };

const composeInvolvedEntityNames =
  (
    actionInvolvedEntityNames: (
      name: string,
      descendantKey?: string,
    ) => {
      [key: string]: string;
    },
    involvedOutputDescendantKeys:
      | undefined
      | {
          [entityName: string]: {
            outputEntity: string;
          };
        },
    descendantKey: string,
  ) =>
  (entityConfig: EntityConfig) => {
    const defaultInvolvedEntityNames = actionInvolvedEntityNames(entityConfig.name, descendantKey);

    if (!involvedOutputDescendantKeys?.[entityConfig.name]) {
      return defaultInvolvedEntityNames;
    }

    const { inputOutputEntity: inputEntity, ...rest } = defaultInvolvedEntityNames;

    const outputDescendantKeys = involvedOutputDescendantKeys[entityConfig.name];

    const outputEntityNames = Object.keys(outputDescendantKeys).reduce<Record<string, any>>(
      (prev, outputEntityKey) => {
        prev[outputEntityKey] = `${entityConfig.name}${outputDescendantKeys[outputEntityKey]}`; // eslint-disable-line no-param-reassign

        return prev;
      },
      {},
    );

    return { ...rest, ...outputEntityNames, inputEntity };
  };

const amendOutputDescendantKey = (
  descendantKey: string,
  entityConfig: EntityConfig,
  involvedOutputDescendantKeys:
    | undefined
    | {
        [entityName: string]: {
          outputEntity: string;
        };
      },
) => {
  if (!involvedOutputDescendantKeys?.[entityConfig.name]) {
    return descendantKey;
  }

  const {
    [entityConfig.name]: { outputEntity: amendedDescendantKey },
  } = involvedOutputDescendantKeys;

  return amendedDescendantKey;
};

const composeType =
  (
    actionReturnString: (entityConfig: EntityConfig, descendantKey: string) => string,
    descendantKey: string,
    involvedOutputDescendantKeys:
      | undefined
      | {
          [entityName: string]: {
            outputEntity: string;
          };
        },
  ) =>
  (entityConfig: EntityConfig) => {
    const amendedOutputDescendantKey = amendOutputDescendantKey(
      descendantKey,
      entityConfig,
      involvedOutputDescendantKeys,
    );

    return actionReturnString(entityConfig, amendedOutputDescendantKey);
  };

const composeCustomAction = (
  { allow, descendantKey, involvedOutputDescendantKeys }: DescendantAttributes,
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
  const name = actionGeneralName(descendantKey);

  return {
    name,
    specificName: (entityConfig, generalConfig) => {
      const { name: baseEntityName } = entityConfig;
      if (
        !(
          allow[baseEntityName] &&
          allow[baseEntityName].includes(actionGeneralName('') as DescendantAttributesActionName)
        )
      )
        return '';

      const descendantConfig = composeDescendantConfigByName(
        descendantKey,
        entityConfig,
        generalConfig,
      );

      return actionAllowed(descendantConfig) ? actionName(baseEntityName, descendantKey) : '';
    },

    argNames: composeArgNames(argNames, inputCreators, descendantKey),
    argTypes: composeArgTypes(argTypes, inputCreators, descendantKey),

    involvedEntityNames: composeInvolvedEntityNames(
      actionInvolvedEntityNames,
      involvedOutputDescendantKeys,
      descendantKey,
    ),

    type: composeType(actionReturnString, descendantKey, involvedOutputDescendantKeys),

    config: (entityConfig, generalConfig) =>
      actionReturnConfig(
        entityConfig,
        generalConfig,
        amendOutputDescendantKey(descendantKey, entityConfig, involvedOutputDescendantKeys),
      ),
  };
};

export default composeCustomAction;
