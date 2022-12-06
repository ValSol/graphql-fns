// @flow

import type { EntityConfig, SimplifiedEntityConfig } from '../flowTypes';

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

const allowedConfigTypes = ['embedded', 'file', 'tangible', 'tangibleFile', 'virtual'];

const composeEntityConfig = (
  simplifiedEntityConfig: SimplifiedEntityConfig,
  entityConfig: EntityConfig,
  entityConfigs: { [entityName: string]: EntityConfig },
) => {
  const { name, type: configType = 'tangible' } = simplifiedEntityConfig;

  if (!allowedConfigTypes.includes(configType)) {
    throw new TypeError(`Not allowed config name: "${configType}"`);
  }

  entityConfig.type = configType; // eslint-disable-line no-param-reassign

  const {
    embeddedFields: simplifiedEmbeddedFields,
    childFields: simplifiedChildFields,
    duplexFields: simplifiedDuplexFields,
    fileFields: simplifiedFileFields,
    relationalFields: simplifiedRelationalFields,
  } = simplifiedEntityConfig;

  // check field names
  Object.keys(simplifiedEntityConfig)
    .filter((key) => key.endsWith('Fields'))
    .forEach((key) => {
      // $FlowFixMe
      simplifiedEntityConfig[key].forEach(({ name: fieldName, freeze }) => {
        if (fieldName.search('_') !== -1) {
          throw new TypeError(
            `Forbidden to use "_" (underscore) in field name: "${fieldName}" in entity: "${name}"!`,
          );
        }
        if (forbiddenFieldNames.includes(fieldName)) {
          throw new TypeError(`Forbidden field name: "${fieldName}" in entity: "${name}"!`);
        }
        if (freeze && (configType === 'embedded' || configType === 'virtual')) {
          throw new TypeError(
            `Forbidden freeze field: "${fieldName}" in ${
              configType === 'embedded' ? 'embedded' : 'virtual'
            } entity: "${name}"!`,
          );
        }
      });
    });

  if (simplifiedEmbeddedFields) {
    // eslint-disable-next-line no-param-reassign
    entityConfig.embeddedFields = simplifiedEmbeddedFields.map((field) => {
      const { configName, ...restField } = field;
      const config = entityConfigs[configName];

      if (!config) {
        throw new TypeError(
          `Incorrect configName: "${configName}" in embedded field: "${field.name}" of simplified entityConfig: "${name}"!`,
        );
      }

      // check "&& name" to only
      if (config.type !== 'embedded' && config.type !== 'file') {
        if (name) {
          throw new TypeError(
            `Not embedded config: "${configName}" in embedded field: "${field.name}" of simplified entityConfig: "${name}"!`,
          );
        } else {
          // name=undefined if entityConfig is a derivativeConfig
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

  if (simplifiedChildFields) {
    if (configType !== 'virtual') {
      throw new TypeError(
        `Entity config "${name}" type is "${configType}" but have to be only "virtual" to have childFields!`,
      );
    }

    // eslint-disable-next-line no-param-reassign
    entityConfig.childFields = simplifiedChildFields.map((field) => {
      const { configName, ...restField } = field;
      const config = entityConfigs[configName];

      if (!config) {
        throw new TypeError(
          `Incorrect configName: "${configName}" in child field: "${field.name}" of simplified entityConfig: "${name}"!`,
        );
      }

      if (
        config.type !== 'tangible' &&
        config.type !== 'tangibleFile' &&
        config.type !== 'virtual'
      ) {
        throw new TypeError(
          `Forbidden config type: "${config.type}" in child field: "${field.name}" of simplified entityConfig: "${name}"!`,
        );
      }

      return { ...restField, config };
    });
  }

  if (simplifiedFileFields) {
    // eslint-disable-next-line no-param-reassign
    entityConfig.fileFields = simplifiedFileFields.map((field) => {
      const { configName, ...restField } = field;
      const config = entityConfigs[configName];

      if (!config) {
        throw new TypeError(
          `Incorrect configName: "${configName}" in file field: "${field.name}" of simplified entityConfig: "${name}"!`,
        );
      }

      if (config.type !== 'file') {
        throw new TypeError(
          `Not file config: "${configName}" in file field: "${field.name}" of simplified entityConfig: "${name}"!`,
        );
      }

      return { ...restField, config };
    });
  }

  if (simplifiedRelationalFields) {
    // eslint-disable-next-line no-param-reassign
    entityConfig.relationalFields = simplifiedRelationalFields.map((field) => {
      const { configName, ...restField } = field;
      const config = entityConfigs[configName];
      if (!config) {
        throw new TypeError(
          `Incorrect configName: "${configName}" in relational field: "${field.name}" of simplified entityConfig: "${simplifiedEntityConfig.name}"!`,
        );
      }
      return { ...restField, config };
    });
  }

  if (simplifiedDuplexFields) {
    // eslint-disable-next-line no-param-reassign
    entityConfig.duplexFields = simplifiedDuplexFields.map((field) => {
      const { configName, ...restField } = field;
      const config = entityConfigs[configName];
      if (!config) {
        throw new TypeError(
          `Incorrect configName: "${configName}" in duplex field: "${field.name}" of simplified entityConfig: "${simplifiedEntityConfig.name}"!`,
        );
      }

      return { ...restField, config };
    });
  }
};

export default composeEntityConfig;
