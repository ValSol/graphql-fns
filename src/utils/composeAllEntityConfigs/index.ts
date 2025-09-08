import pluralize from 'pluralize';

import type {
  EntityConfig,
  Enums,
  SimplifiedEntityConfig,
  SimplifiedTangibleEntityConfig,
  TangibleEntityConfig,
} from '@/tsTypes';

import virtualConfigComposers, { VirtualConfigComposerItem } from '@/types/virtualConfigComposers';
import composeEntityConfig from '../composeEntityConfig';
import isCommonlyAllowedTypeName from '../isCommonlyAllowedTypeName';
import PageInfo from './pageInfoConfig';

// alsow used in "composeAllEntityConfigs" util
const forbiddenThingNames = ['DateTime', 'Node', 'node', 'PageInfo'];

const composeAllEntityConfigsAndEnums = (
  simplifiedEntityConfigs: SimplifiedEntityConfig[],
  enums: Enums = {},
): { [entityName: string]: EntityConfig } => {
  const { relationalOppositeNames, result } = simplifiedEntityConfigs.reduce(
    (prev, config) => {
      const { name } = config;

      if (name.search('_') !== -1) {
        throw new TypeError(`Forbidden to use "_" (underscore) in entity name: "${name}"!`);
      }

      if (pluralize(name) === name) {
        throw new TypeError(`Forbidden entity name: "${name}" in plural form!`);
      }

      if (forbiddenThingNames.includes(name)) {
        throw new TypeError(`Forbidden entity name: "${name}"!`);
      }

      if (!isCommonlyAllowedTypeName(name)) {
        throw new TypeError(`Incorrect entity name: "${name}"!`);
      }

      if (prev.result[name] !== undefined) {
        throw new TypeError(`Unique entity name: "${name}" is used twice!`);
      }

      (config.enumFields || []).forEach(({ name: fieldName, enumName }) => {
        if (!enums[enumName]) {
          throw new TypeError(
            `Got incorrect enumeration: "${enumName}" enum field: "${fieldName}" of "${name}" entity!`,
          );
        }
      });

      ((config as SimplifiedTangibleEntityConfig).relationalFields || []).forEach(
        ({ oppositeName, configName }) => {
          if (prev.relationalOppositeNames[configName] === undefined) {
            prev.relationalOppositeNames[configName] = [];
          }

          if (prev.relationalOppositeNames[configName].includes(oppositeName)) {
            throw new TypeError(
              `Relational field opposite name: "${oppositeName}" is used twice in "${configName}" enity!`,
            );
          }

          prev.relationalOppositeNames[configName].push(oppositeName);
        },
      );

      // save in result DEEP clone of config
      prev.result[name] = Object.keys(config).reduce((prev, key) => {
        const value = config[key];

        if (Array.isArray(value)) {
          prev[key] = [...value];
        } else {
          prev[key] = value;
        }

        return prev;
      }, {});

      return prev;
    },
    { result: { PageInfo }, relationalOppositeNames: {} },
  );

  simplifiedEntityConfigs.forEach((simplifiedEntityConfig) => {
    const { name } = simplifiedEntityConfig;

    const { subscriptionActorConfigName, ...rest } =
      simplifiedEntityConfig as SimplifiedTangibleEntityConfig;

    if (subscriptionActorConfigName) {
      const subscriptionActorConfig = result[subscriptionActorConfigName];

      if (!subscriptionActorConfig) {
        throw new TypeError(
          `Not found subscription actor config: "${subscriptionActorConfigName}" for tangible config: "${name}"!`,
        );
      }

      if (subscriptionActorConfig.type !== 'virtual') {
        throw new TypeError(
          `Subscription actor config: "${subscriptionActorConfigName}" has type "${subscriptionActorConfig.type}" but has to have: "virtual"!`,
        );
      }

      result[name].subscriptionActorConfig = subscriptionActorConfig;
    }

    composeEntityConfig(rest, result[name], result, relationalOppositeNames);
  });

  // copmpose virtual configs

  Object.keys(result).forEach((name) => {
    const config = result[name];
    const { type: configType } = config;

    virtualConfigComposers.forEach(
      ([composeVirtualConfig, composeVirtualConfigName, checker]: VirtualConfigComposerItem) => {
        if (!checker(configType)) return;

        const virtualConfigName = composeVirtualConfigName(name);

        if (result[virtualConfigName] !== undefined) {
          throw new TypeError(
            `Forbidden to use "${virtualConfigName}" becouse there is tangible config with name: "${name}"!`,
          );
        }

        const virtualConfig = composeVirtualConfig(config, { allEntityConfigs: result }); // imitate generalConfig

        result[virtualConfig.name] = virtualConfig;
      },
    );
  });

  return result;
};

export default composeAllEntityConfigsAndEnums;
