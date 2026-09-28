import type {
  EntityConfig,
  GeneralConfig,
  ServersideConfig,
  TangibleEntityConfig,
} from '@/tsTypes';

import composeFieldsObject from '@/utils/composeFieldsObject';
import composeRepresentationConfig from '@/utils/composeRepresentationConfig';
import composeRepresentationConfigName from '@/utils/composeRepresentationConfig/composeRepresentationConfigName';
import parseEntityName from '@/utils/parseEntityName';

const alwaysAllowedFieldsToUseNames = ['id', 'createdAt', 'updatedAt'];

// check that calculated fields declared in "generalConfig" and their callbacks...
// ... in "serversideConfig.calculatedFields" match each other
const checkCalculatedFieldsCallbacks = (
  generalConfig: GeneralConfig,
  entityTypeDic: { [entityName: string]: string },
  serversideConfig: ServersideConfig,
) => {
  const { allEntityConfigs, representations = {} } = generalConfig;
  const { calculatedFields: allCallbacks = {} } = serversideConfig;

  // "entityConfigName" -> names of calculated fields whose callbacks are looked up by this name
  const usedCallbackNames: Record<string, string[]> = {};
  const checkedConfigNames: string[] = [];

  const checkEntityConfig = (entityConfig: EntityConfig, rootConfig: EntityConfig) => {
    if (entityConfig.type !== 'tangible') return;

    const { name, calculatedFields = [] } = entityConfig as TangibleEntityConfig;
    const { name: rootName } = rootConfig;

    checkedConfigNames.push(name);

    calculatedFields.forEach(({ name: fieldName, async }) => {
      const callbacksName = allCallbacks[name]?.[fieldName] ? name : rootName;

      // "fieldsToUseNames" are checked against fields of the config the callbacks are taken from:...
      // ...a representation queries the root collection, so its inherited calculated fields...
      // ...may use root fields that the representation excludes
      const callbacksConfig = (
        callbacksName === name ? entityConfig : rootConfig
      ) as TangibleEntityConfig;

      const fieldNames = Object.keys(composeFieldsObject(callbacksConfig).fieldsObject);

      const callbacks = allCallbacks[callbacksName]?.[fieldName];

      if (!callbacks) {
        throw new TypeError(
          `Not found callbacks of calculated field "${fieldName}" of entity "${name}" in "serversideConfig.calculatedFields"!`,
        );
      }

      if (!usedCallbackNames[callbacksName]) usedCallbackNames[callbacksName] = [];
      usedCallbackNames[callbacksName].push(fieldName);

      const { func, asyncFunc, fieldsToUseNames = [] } = callbacks;

      if (typeof func !== 'function') {
        throw new TypeError(
          `Not found "func" of calculated field "${fieldName}" of entity "${name}" in "serversideConfig.calculatedFields"!`,
        );
      }

      if (Boolean(async) !== (typeof asyncFunc === 'function')) {
        throw new TypeError(
          async
            ? `Calculated field "${fieldName}" of entity "${name}" has "async: true" but not got "asyncFunc" in "serversideConfig.calculatedFields"!`
            : `Calculated field "${fieldName}" of entity "${name}" has "asyncFunc" in "serversideConfig.calculatedFields" but not has "async: true"!`,
        );
      }

      fieldsToUseNames.forEach((fieldToUseName) => {
        if (
          !fieldNames.includes(fieldToUseName) &&
          !alwaysAllowedFieldsToUseNames.includes(fieldToUseName) &&
          !(fieldToUseName === 'counter' && callbacksConfig.counter)
        ) {
          throw new TypeError(
            `Incorrect field: "${fieldToUseName}" in "fieldsToUseNames" of calculated field "${fieldName}" of entity "${name}"!`,
          );
        }
      });
    });
  };

  Object.keys(allEntityConfigs).forEach((entityName) => {
    const entityConfig = allEntityConfigs[entityName];

    checkEntityConfig(entityConfig, entityConfig);

    Object.keys(representations).forEach((representationKey) => {
      const key = composeRepresentationConfigName(
        entityName,
        representationKey,
        entityConfig.representationNameSlicePosition,
      );

      if (!entityTypeDic[key]) return;

      const representationConfig = composeRepresentationConfig(
        representations[representationKey],
        entityConfig,
        generalConfig,
      );

      if (representationConfig) {
        checkEntityConfig(representationConfig, entityConfig);
      }
    });
  });

  Object.keys(allCallbacks).forEach((entityConfigName) => {
    if (!checkedConfigNames.includes(entityConfigName)) {
      // a representation config not used in the schema is skipped, unknown names are errors
      try {
        parseEntityName(entityConfigName, generalConfig);
      } catch {
        throw new TypeError(
          `Unknown entity "${entityConfigName}" in "serversideConfig.calculatedFields"!`,
        );
      }

      return;
    }

    Object.keys(allCallbacks[entityConfigName]).forEach((fieldName) => {
      if (!usedCallbackNames[entityConfigName]?.includes(fieldName)) {
        throw new TypeError(
          `Callbacks of "${entityConfigName}" entity in "serversideConfig.calculatedFields" have no calculated field "${fieldName}"!`,
        );
      }
    });
  });
};

export default checkCalculatedFieldsCallbacks;
