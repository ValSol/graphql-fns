import pluralize from 'pluralize';

import type {
  EntityConfig,
  Enums,
  SimplifiedEntityConfig,
  SimplifiedTangibleEntityConfig,
} from '../../tsTypes';

import virtualConfigComposers from '../../types/virtualConfigComposers';
import composeEntityConfig from '../composeEntityConfig';
import composeTangibleFileConfigName from './composeTangibleFileConfigName';
import composeTangibleFileEntityConfig from './composeTangibleFileEntityConfig';
import PageInfo from './pageInfoConfig';

// alsow used in "composeAllEntityConfigs" util
const forbiddenThingNames = ['File', 'DateTime', 'Node', 'node', 'PageInfo'];

const composeAllEntityConfigs = (
  simplifiedThingConfigs: SimplifiedEntityConfig[],
  enums: Enums = {},
): {
  [entityName: string]: EntityConfig;
} => {
  const { relationalOppositeNames, result } = simplifiedThingConfigs.reduce(
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

  simplifiedThingConfigs.forEach((simplifiedEntityConfig) => {
    const { name, type: configType = 'tangible' } = simplifiedEntityConfig;
    composeEntityConfig(simplifiedEntityConfig, result[name], result, relationalOppositeNames);

    const config = result[name];

    if (configType === 'file') {
      const tangibleFileConfigName = composeTangibleFileConfigName(name);

      if (result[tangibleFileConfigName] !== undefined) {
        throw new TypeError(
          `Forbidden to use "${tangibleFileConfigName}" becouse there is file name: "${name}"!`,
        );
      }

      const tangibleFileConfig = composeTangibleFileEntityConfig(config);

      result[tangibleFileConfig.name] = tangibleFileConfig; // eslint-disable-line no-param-reassign
    }
  });

  // copmpose virtual configs

  Object.keys(result).forEach((name) => {
    const config = result[name];
    const { type: configType } = config;

    virtualConfigComposers.forEach(
      ([composeVirtualConfig, composeVirtualConfigName, checker]: [any, any, any]) => {
        if (!checker(configType)) return;

        const virtualConfigName = composeVirtualConfigName(name);

        if (result[virtualConfigName] !== undefined) {
          throw new TypeError(
            `Forbidden to use "${virtualConfigName}" becouse there is tangible config with name: "${name}"!`,
          );
        }

        const virtualConfig = composeVirtualConfig(config, { allEntityConfigs: result }); // imitate generalConfig

        result[virtualConfig.name] = virtualConfig; // eslint-disable-line no-param-reassign
      },
    );
  });

  return result;
};

export default composeAllEntityConfigs;
