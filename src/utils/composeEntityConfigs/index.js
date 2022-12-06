// @flow

import pluralize from 'pluralize';

import type { EntityConfig, SimplifiedEntityConfig } from '../../flowTypes';

import composeEntityConfig from '../composeEntityConfig';
import composeTangibleFileEntityConfig from './composeTangibleFileEntityConfig';
import PageInfo from './pageInfoConfig';

const forbiddenThingNames = ['File', 'DateTime', 'Node', 'node', 'PageInfo'];

const composeEntityConfigs = (
  simplifiedThingConfigs: Array<SimplifiedEntityConfig>,
): { [entityName: string]: EntityConfig } => {
  const result = simplifiedThingConfigs.reduce(
    (prev, config) => {
      const { name, type: configType } = config;

      if (name.search('_') !== -1) {
        throw new TypeError(`Forbidden to use "_" (underscore) in entity name: "${name}"!`);
      }

      if (configType === 'file' && name.startsWith('Tangible')) {
        throw new TypeError(`Forbidden to use "Tangible" in file name: "${name}"!`);
      }

      if (configType === 'tangible' && name.endsWith('Edge')) {
        throw new TypeError(`Forbidden to use "Edge" in file name: "${name}"!`);
      }

      if (configType === 'tangible' && name.endsWith('Connection')) {
        throw new TypeError(`Forbidden to use "Connection" in file name: "${name}"!`);
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

      if (configType === 'file') {
        const tangibleFileConfig = composeTangibleFileEntityConfig(config);

        prev[tangibleFileConfig.name] = tangibleFileConfig; // eslint-disable-line no-param-reassign
      }

      return prev;
    },
    { PageInfo },
  );

  simplifiedThingConfigs.forEach((simplifiedThingConfig) => {
    const { name } = simplifiedThingConfig;
    composeEntityConfig(simplifiedThingConfig, result[name], result);
  });

  return result;
};

export default composeEntityConfigs;
