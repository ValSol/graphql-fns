// @flow

import pluralize from 'pluralize';

import type { EntityConfig, SimplifiedEntityConfig } from '../../flowTypes';

import { virtualConfigComposers } from '../../types/actionAttributes';
import virtualConfigComposersObject from '../../types/virtualConfigComposers';
import composeEntityConfig from '../composeEntityConfig';
import composeTangibleFileConfigName from './composeTangibleFileConfigName';
import composeTangibleFileEntityConfig from './composeTangibleFileEntityConfig';
import PageInfo from './pageInfoConfig';

const forbiddenThingNames = ['File', 'DateTime', 'Node', 'node', 'PageInfo'];

const composeAllEntityConfigs = (
  simplifiedThingConfigs: Array<SimplifiedEntityConfig>,
): { [entityName: string]: EntityConfig } => {
  const result = simplifiedThingConfigs.reduce(
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

      if (prev[name]) {
        throw new TypeError(`Unique entity name: "${name}" is used twice!`);
      }

      prev[name] = { ...config }; // eslint-disable-line no-param-reassign

      return prev;
    },
    { PageInfo },
  );

  simplifiedThingConfigs.forEach((simplifiedThingConfig) => {
    const { name, type: configType = 'tangible' } = simplifiedThingConfig;
    composeEntityConfig(simplifiedThingConfig, result[name], result);

    const config = result[name];

    if (configType === 'file') {
      const tangibleFileConfigName = composeTangibleFileConfigName(name);

      if (result[tangibleFileConfigName]) {
        throw new TypeError(
          `Forbidden to use "${tangibleFileConfigName}" becouse there is file name: "${name}"!`,
        );
      }

      const tangibleFileConfig = composeTangibleFileEntityConfig(config);

      result[tangibleFileConfig.name] = tangibleFileConfig; // eslint-disable-line no-param-reassign

      virtualConfigComposers.forEach(([key]) => {
        const [composeVirtualConfig, composeVirtualConfigName] = virtualConfigComposersObject[key];

        const virtualConfigName = composeVirtualConfigName(tangibleFileConfig.name);

        if (result[virtualConfigName]) {
          throw new TypeError(
            `Forbidden to use "${virtualConfigName}" becouse there is tangibleFile config with name: "${tangibleFileConfig.name}"!`,
          );
        }

        const virtualConfig = composeVirtualConfig(tangibleFileConfig, {
          allEntityConfigs: result,
        }); // imitate generalConfig

        result[virtualConfig.name] = virtualConfig; // eslint-disable-line no-param-reassign
      });
    }

    if (configType === 'tangible') {
      virtualConfigComposers.forEach(([key]) => {
        const [composeVirtualConfig, composeVirtualConfigName] = virtualConfigComposersObject[key];

        const virtualConfigName = composeVirtualConfigName(name);

        if (result[virtualConfigName]) {
          throw new TypeError(
            `Forbidden to use "${virtualConfigName}" becouse there is tangible config with name: "${name}"!`,
          );
        }

        const virtualConfig = composeVirtualConfig(config, { allEntityConfigs: result }); // imitate generalConfig

        result[virtualConfig.name] = virtualConfig; // eslint-disable-line no-param-reassign
      });
    }
  });

  return result;
};

export default composeAllEntityConfigs;
