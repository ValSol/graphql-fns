// @flow

import type { ThingConfig, SimplifiedThingConfig } from '../flowTypes';

const forbiddenFieldNames = [
  'in',
  'nin',
  'ne',
  'gt',
  'gte',
  'lt',
  'lte',
  're',
  'id',
  'createdAt',
  'updatedAt',
  'counter',
  'connect',
  'create',
];

const allowedConfigTypes = ['embedded', 'file', 'tangible', 'virtual'];

const composeThingConfig = (
  simplifiedThingConfig: SimplifiedThingConfig,
  thingConfig: ThingConfig,
  thingConfigs: { [thingName: string]: ThingConfig },
) => {
  const { name, type: configType = 'tangible' } = simplifiedThingConfig;

  if (!allowedConfigTypes.includes(configType)) {
    throw new TypeError(`Not allowed config name: "${configType}"`);
  }

  thingConfig.type = configType; // eslint-disable-line no-param-reassign

  const {
    embeddedFields: simplifiedEmbeddedFields,
    duplexFields: simplifiedDuplexFields,
    fileFields: simplifiedFileFields,
    relationalFields: simplifiedRelationalFields,
  } = simplifiedThingConfig;

  // check field names
  Object.keys(simplifiedThingConfig)
    .filter((key) => key.endsWith('Fields'))
    .forEach((key) => {
      // $FlowFixMe
      simplifiedThingConfig[key].forEach(({ name: fieldName, freeze }) => {
        if (fieldName.search('_') !== -1) {
          throw new TypeError(
            `Forbidden to use "_" (underscore) in field name: "${fieldName}" in thing: "${name}"!`,
          );
        }
        if (forbiddenFieldNames.includes(fieldName)) {
          throw new TypeError(`Forbidden field name: "${fieldName}" in thing: "${name}"!`);
        }
        if (freeze && (configType === 'embedded' || configType === 'virtual')) {
          throw new TypeError(
            `Forbidden freeze field: "${fieldName}" in ${
              configType === 'embedded' ? 'embedded' : 'virtual'
            } thing: "${name}"!`,
          );
        }
      });
    });

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

      // check "&& name" to only
      if (config.type !== 'embedded' && config.type !== 'file' && name) {
        if (name) {
          throw new TypeError(
            `Not embedded config: "${configName}" in embedded field: "${field.name}" of simplified thingConfig: "${name}"!`,
          );
        } else {
          // name=undefined if thingConfig is a derivativeConfig
          // eslint-disable-next-line no-console
          console.warn(
            '\x1b[33m',
            `Not embedded config: "${configName}" in embedded field: "${field.name}"!`,
            '\x1b[0m',
          );
        }
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

      if (config.type !== 'file') {
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
