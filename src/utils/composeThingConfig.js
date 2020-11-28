// @flow

import type { ThingConfig, SimplifiedThingConfig } from '../flowTypes';

const composeThingConfig = (
  simplifiedThingConfig: SimplifiedThingConfig,
  thingConfig: ThingConfig,
  thingConfigs: { [thingName: string]: ThingConfig },
) => {
  const { name } = simplifiedThingConfig;
  const {
    embeddedFields: simplifiedEmbeddedFields,
    fileFields: simplifiedFileFields,
    duplexFields: simplifiedDuplexFields,
    relationalFields: simplifiedRelationalFields,
  } = simplifiedThingConfig;

  if (simplifiedEmbeddedFields) {
    // eslint-disable-next-line no-param-reassign
    thingConfig.embeddedFields = simplifiedEmbeddedFields.map((field) => {
      const { configName, ...restField } = field;
      const config = thingConfigs[configName];

      if (!config) {
        throw new TypeError(
          `Incorrect configName: "${configName}" in embedded field: "${field.name}" of simplified thingConfig: "${name}"!`,
        );
      }

      if (!config.embedded && !config.file) {
        throw new TypeError(
          `Not embedded config: "${configName}" in embedded field: "${field.name}" of simplified thingConfig: "${name}"!`,
        );
      }

      return { ...restField, config };
    });
  }

  if (simplifiedFileFields) {
    // eslint-disable-next-line no-param-reassign
    thingConfig.fileFields = simplifiedFileFields.map((field) => {
      const { configName, ...restField } = field;
      const config = thingConfigs[configName];

      if (!config) {
        throw new TypeError(
          `Incorrect configName: "${configName}" in file field: "${field.name}" of simplified thingConfig: "${name}"!`,
        );
      }

      if (!config.file) {
        throw new TypeError(
          `Not file config: "${configName}" in file field: "${field.name}" of simplified thingConfig: "${name}"!`,
        );
      }

      return { ...restField, config };
    });
  }

  if (simplifiedRelationalFields) {
    // eslint-disable-next-line no-param-reassign
    thingConfig.relationalFields = simplifiedRelationalFields.map((field) => {
      const { configName, ...restField } = field;
      const config = thingConfigs[configName];
      if (!config) {
        throw new TypeError(
          `Incorrect configName: "${configName}" in relational field: "${field.name}" of simplified thingConfig: "${simplifiedThingConfig.name}"!`,
        );
      }
      return { ...restField, config };
    });
  }

  if (simplifiedDuplexFields) {
    // eslint-disable-next-line no-param-reassign
    thingConfig.duplexFields = simplifiedDuplexFields.map((field) => {
      const { configName, ...restField } = field;
      const config = thingConfigs[configName];
      if (!config) {
        throw new TypeError(
          `Incorrect configName: "${configName}" in duplex field: "${field.name}" of simplified thingConfig: "${simplifiedThingConfig.name}"!`,
        );
      }
      return { ...restField, config };
    });
  }
};

export default composeThingConfig;
