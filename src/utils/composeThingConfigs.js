// @flow

import type { ThingConfig, SimplifiedThingConfig } from '../flowTypes';

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
    const {
      embeddedFields: simplifiedEmbeddedFields,
      fileFields: simplifiedFileFields,
      duplexFields: simplifiedDuplexFields,
      relationalFields: simplifiedRelationalFields,
    } = simplifiedThingConfig;

    if (simplifiedEmbeddedFields) {
      result[name].embeddedFields = simplifiedEmbeddedFields.map((field) => {
        const { configName, ...restField } = field;
        const config = result[configName];
        if (!config) {
          throw new TypeError(
            `Incorrect configName: "${configName}" in embedded field: "${field.name}" of simplified thingConfig: "${name}"!`,
          );
        }
        return { ...restField, config };
      });
    }

    if (simplifiedFileFields) {
      result[name].fileFields = simplifiedFileFields.map((field) => {
        const { configName, ...restField } = field;
        const config = result[configName];
        if (!config) {
          throw new TypeError(
            `Incorrect configName: "${configName}" in file field: "${field.name}" of simplified thingConfig: "${name}"!`,
          );
        }
        return { ...restField, config };
      });
    }

    if (simplifiedRelationalFields) {
      result[name].relationalFields = simplifiedRelationalFields.map((field) => {
        const { configName, ...restField } = field;
        const config = result[configName];
        if (!config) {
          throw new TypeError(
            `Incorrect configName: "${configName}" in relational field: "${field.name}" of simplified thingConfig: "${simplifiedThingConfig.name}"!`,
          );
        }
        return { ...restField, config };
      });
    }

    if (simplifiedDuplexFields) {
      result[name].duplexFields = simplifiedDuplexFields.map((field) => {
        const { configName, ...restField } = field;
        const config = result[configName];
        if (!config) {
          throw new TypeError(
            `Incorrect configName: "${configName}" in duplex field: "${field.name}" of simplified thingConfig: "${simplifiedThingConfig.name}"!`,
          );
        }
        return { ...restField, config };
      });
    }
  });

  return result;
};

export default composeThingConfigs;
