// @flow

import type { ThingConfig, SimplifiedThingConfig } from '../flowTypes';

import composeThingConfig from './composeThingConfig';

const composeThingConfigs = (
  simplifiedThingConfigs: Array<SimplifiedThingConfig>,
): { [thingName: string]: ThingConfig } => {
  const result = simplifiedThingConfigs.reduce((prev, config) => {
    const { name } = config;
    if (prev[name]) {
      throw TypeError(`Unique thing name: "${name}" is used twice!`);
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
