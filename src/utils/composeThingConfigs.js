// @flow

import pluralize from 'pluralize';

import type { ThingConfig, SimplifiedThingConfig } from '../flowTypes';

import composeThingConfig from './composeThingConfig';

const forbiddenThingNames = ['File', 'DateTime'];

const composeThingConfigs = (
  simplifiedThingConfigs: Array<SimplifiedThingConfig>,
): { [thingName: string]: ThingConfig } => {
  const result = simplifiedThingConfigs.reduce((prev, config) => {
    const { name } = config;
    if (name.search('_') !== -1) {
      throw new TypeError(`Forbidden to use "_" (underscore) in thing name: "${name}"!`);
    }
    if (pluralize(name) === name) {
      throw new TypeError(`Forbidden thing name: "${name}" in plural form!`);
    }
    if (forbiddenThingNames.includes(name)) {
      throw new TypeError(`Forbidden thing name: "${name}"!`);
    }
    if (prev[name]) {
      throw new TypeError(`Unique thing name: "${name}" is used twice!`);
    }
    prev[name] = { ...config }; // eslint-disable-line no-param-reassign
    return prev;
  }, {});

  simplifiedThingConfigs.forEach((simplifiedThingConfig) => {
    const { name } = simplifiedThingConfig;
    composeThingConfig(simplifiedThingConfig, result[name], result);
  });

  return result;
};

export default composeThingConfigs;
