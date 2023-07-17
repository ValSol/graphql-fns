import type {
  EntityConfig,
  SimplifiedEntityConfig,
  TangibleEntityConfig,
  VirtualEntityConfig,
} from '../tsTypes';

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
  allEntityConfigs: {
    [entityName: string]: EntityConfig;
  },
  relationalOppositeNames: { [entityName: string]: string[] },
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
  } = simplifiedEntityConfig as any;

  const fieldNames = [];

  // check field names
  Object.keys(simplifiedEntityConfig)
    .filter((key) => key.endsWith('Fields'))
    .forEach((key) => {
      simplifiedEntityConfig[key].forEach(({ name: fieldName, freeze }) => {
        if (fieldNames.includes(fieldName)) {
          throw new TypeError(`Field name: "${fieldName}" used twice in entity: "${name}"!`);
        }

        if (relationalOppositeNames[name]?.includes(fieldName)) {
          throw new TypeError(
            `Field name: "${fieldName}" already used as relational opposite name in entity: "${name}"!`,
          );
        }

        fieldNames.push(fieldName);

        if (fieldName.search('_') !== -1) {
          throw new TypeError(
            `Forbidden to use "_" (underscore) in field name: "${fieldName}" in entity: "${name}"!`,
          );
        }

        if (fieldName.endsWith('ThroughConnection')) {
          throw new TypeError(
            `Forbidden the field name: "${fieldName}" that ends with "ThroughConnection" in entity: "${name}"!`,
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

      // add field type
      entityConfig[key] = (entityConfig[key] as Record<string, any>[]).map((item) => ({
        ...item,
        type: key,
      }));
    });

  if (simplifiedEmbeddedFields) {
    // eslint-disable-next-line no-param-reassign
    entityConfig.embeddedFields = simplifiedEmbeddedFields.map((field) => {
      const { configName, ...restField } = field;
      const config = allEntityConfigs[configName];

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
          // name=undefined if entityConfig is a descendantConfig
          // eslint-disable-next-line no-console
          console.warn(
            '\x1b[33m',
            `Not embedded config: "${configName}" in embedded field: "${field.name}"!`,
            '\x1b[0m',
          );
        }
      }

      return { ...restField, config, type: 'embeddedFields' };
    });
  }

  if (simplifiedChildFields) {
    if (configType !== 'virtual') {
      throw new TypeError(
        `Entity config "${name}" type is "${configType}" but have to be only "virtual" to have childFields!`,
      );
    }

    // eslint-disable-next-line no-param-reassign
    (entityConfig as VirtualEntityConfig).childFields = simplifiedChildFields.map((field) => {
      const { configName, ...restField } = field;
      const config = allEntityConfigs[configName];

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

      return { ...restField, config, type: 'childFields' };
    });
  }

  if (simplifiedFileFields) {
    // eslint-disable-next-line no-param-reassign
    entityConfig.fileFields = simplifiedFileFields.map((field) => {
      const { configName, ...restField } = field;
      const config = allEntityConfigs[configName];

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

      return { ...restField, config, type: 'fileFields' };
    });
  }

  if (simplifiedRelationalFields) {
    const relationalFields = simplifiedRelationalFields.map((field) => {
      const { configName, ...restField } = field;
      const config = allEntityConfigs[configName] as TangibleEntityConfig;
      if (!config) {
        throw new TypeError(
          `Incorrect configName: "${configName}" in relational field: "${field.name}" of simplified entityConfig: "${simplifiedEntityConfig.name}"!`,
        );
      }

      if (!config.relationalFields) {
        config.relationalFields = [];
      }

      config.relationalFields.push({
        name: field.oppositeName,
        oppositeName: field.name,
        config: allEntityConfigs[entityConfig.name] as TangibleEntityConfig,
        array: true,
        parent: true,
        type: 'relationalFields',
      });

      return { ...restField, config, type: 'relationalFields' };
    });

    Object.assign((entityConfig as TangibleEntityConfig).relationalFields, relationalFields);
  }

  if (simplifiedDuplexFields) {
    // eslint-disable-next-line no-param-reassign
    (entityConfig as TangibleEntityConfig).duplexFields = simplifiedDuplexFields.map((field) => {
      const { configName, ...restField } = field;
      const config = allEntityConfigs[configName];
      if (!config) {
        throw new TypeError(
          `Incorrect configName: "${configName}" in duplex field: "${field.name}" of simplified entityConfig: "${simplifiedEntityConfig.name}"!`,
        );
      }

      return { ...restField, config, type: 'duplexFields' };
    });
  }
};

export default composeEntityConfig;
