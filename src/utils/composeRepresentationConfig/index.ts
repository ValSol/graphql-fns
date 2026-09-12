import type {
  RepresentationAttributes,
  GeneralConfig,
  EntityConfig,
  EntityConfigObject,
  SimplifiedEntityConfig,
  SimplifiedTangibleEntityConfig,
  RepresentationAttributesActionName,
} from '@/tsTypes';

import composeFieldsObject from '@/utils/composeFieldsObject';
import composeEntityConfig from '@/utils/composeEntityConfig';
import composeRepresentationConfigName from './composeRepresentationConfigName';

const store = Object.create(null);

const checkAnyEntityNames =
  (allowEntityNames: Array<string>, representationKey: string) =>
  (EntityNamesObject, fieldType: string) => {
    Object.keys(EntityNamesObject).forEach((entityName) => {
      if (!allowEntityNames.includes(entityName)) {
        throw new TypeError(
          `Incorrect entityName key: "${entityName}" in ${fieldType} of "${representationKey}" representation!`,
        );
      }
    });
  };

const checkAnyFieldNames =
  (rootEntityName: string, fieldsObject: EntityConfigObject, representationKey: string) =>
  (
    EntityNamesObject: {
      [entityName: string]: string[];
    },
    fieldType: string,
  ) => {
    if (EntityNamesObject[rootEntityName]) {
      EntityNamesObject[rootEntityName].forEach((fieldName) => {
        if (!fieldsObject[fieldName]) {
          throw new TypeError(
            `Incorrect ${fieldType} field name "${fieldName}" for "${rootEntityName}" in: "${representationKey}" representation!`,
          );
        }
      });
    }
  };

const composeRepresentationConfig = (
  signatureMethods: RepresentationAttributes,
  rootEntityConfig: EntityConfig,
  generalConfig: GeneralConfig,
): null | EntityConfig => {
  const { name: rootEntityName, representationNameSlicePosition } = rootEntityConfig;

  const {
    representationKey,
    allow,
    addFields = {},
    excludeFields = {},
    includeFields = {},
    interfaces = {},
    freezedFields = {},
    unfreezedFields = {},
  } = signatureMethods;

  const { representation, allEntityConfigs } = generalConfig;

  if (!representation)
    throw new TypeError('"representation" attribute of generalConfig must be setted!');

  if (!allow[rootEntityName]) return null; // not error but negative result of function!

  const representationEntityName = composeRepresentationConfigName(
    rootEntityName,
    representationKey,
    representationNameSlicePosition,
  );

  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[representationEntityName]) {
    return store[representationEntityName];
  }

  const { fieldsObject } = composeFieldsObject(rootEntityConfig);

  const allowEntityNames = Object.keys(allow);

  const checkEntityNames = checkAnyEntityNames(allowEntityNames, representationKey);
  const checkFieldNames = checkAnyFieldNames(rootEntityName, fieldsObject, representationKey);

  // *** start check args correctness

  checkEntityNames(excludeFields, 'excludeFields');
  checkFieldNames(excludeFields, 'excludeFields');

  checkEntityNames(includeFields, 'includeFields');
  checkFieldNames(includeFields, 'includeFields');

  checkEntityNames(freezedFields, 'freezedFields');
  checkFieldNames(freezedFields, 'freezedFields');

  checkEntityNames(unfreezedFields, 'unfreezedFields');
  checkFieldNames(unfreezedFields, 'unfreezedFields');

  checkEntityNames(addFields, 'addFields');

  checkEntityNames(interfaces, 'interfaces');

  type TangibleFields = Omit<SimplifiedTangibleEntityConfig, 'name' | 'type' | 'counter'>;

  ((addFields[rootEntityName] as TangibleFields)?.relationalFields || []).forEach(({ name }) => {
    throw new TypeError(
      `Forbidden to put relationalFields into "addFields" but got "${name}" field!`,
    );
  });

  ((addFields[rootEntityName] as TangibleFields)?.duplexFields || []).forEach(({ name }) => {
    throw new TypeError(`Forbidden to put duplexFields into "addFields" but got "${name}" field!`);
  });

  ((addFields[rootEntityName] as TangibleFields)?.filterFields || []).forEach(({ name }) => {
    throw new TypeError(`Forbidden to put filterFields into "addFields" but got "${name}" field!`);
  });

  const entityConfig = { ...rootEntityConfig, name: representationEntityName };

  store[representationEntityName] = entityConfig;

  if (interfaces[rootEntityName] !== undefined) {
    entityConfig.interfaces = interfaces[rootEntityName] as string[];
  } else {
    delete entityConfig.interfaces;
  }

  if (includeFields[rootEntityName]) {
    Object.keys(entityConfig).forEach((key) => {
      if (key.endsWith('Fields')) {
        entityConfig[key] = entityConfig[key].filter(({ name }) =>
          includeFields[rootEntityName].includes(name),
        );
      }
    });
  }

  if (excludeFields[rootEntityName]) {
    Object.keys(entityConfig).forEach((key) => {
      if (key.endsWith('Fields')) {
        entityConfig[key] = entityConfig[key].filter(
          ({ name }) => !excludeFields[rootEntityName].includes(name),
        );
      }
    });
  }

  if (addFields[rootEntityName]) {
    const addFields2 = {
      ...addFields[rootEntityName],
      // name used also for cache results in composeFieldsObject util
      name: `fieldsToAdd ${representationEntityName}`,
    };

    composeEntityConfig(
      addFields[rootEntityName] as SimplifiedEntityConfig,
      addFields2 as unknown as EntityConfig,
      allEntityConfigs,
      { [representationEntityName]: [] }, // TODO use correct relationalOppositeNames
    );

    const { fieldsObject: fieldsToAddObject } = composeFieldsObject(
      addFields2 as unknown as EntityConfig,
    );

    Object.keys(fieldsToAddObject).forEach((fieldName) => {
      if (fieldsObject[fieldName]) {
        const { type: fieldType } = fieldsObject[fieldName];
        entityConfig[fieldType] = entityConfig[fieldType].filter(({ name }) => name !== fieldName);
      }
      const fieldToAdd = fieldsToAddObject[fieldName];

      const { type: fieldType } = fieldToAdd;

      if (entityConfig[fieldType]) {
        entityConfig[fieldType].push(fieldToAdd);
      } else {
        entityConfig[fieldType] = [fieldToAdd];
      }
    });
  }

  const filterFieldsCalculated =
    entityConfig.type === 'tangible' && entityConfig.calculatedFields
      ? entityConfig.calculatedFields.filter(
          ({ calculatedType }) => calculatedType === 'filterFields',
        )
      : [];

  Object.keys(entityConfig).forEach((key) => {
    if (
      key === 'relationalFields' ||
      key === 'duplexFields' ||
      key === 'filterFields' ||
      key === 'childFields' ||
      key === 'calculatedFields'
    ) {
      entityConfig[key] = entityConfig[key].map((item) => {
        const { name, oppositeName, array, config: currentConfig, required } = item;

        if (name === 'pageInfo') {
          // field "pageInfo" refers to standard child config "PageInfo" so skip it
          return item;
        }

        if (key === 'calculatedFields' && item.calculatedType !== 'filterFields') {
          // if "calculatedFields" calculatedType is not "filterFields" skip it
          return item;
        }

        if (representation[representationKey].allow[currentConfig.name] === undefined) {
          throw new TypeError(
            `Have to include "${currentConfig.name}" entity as "allow" for representationKey: "${representationKey}"!`,
          );
        }

        const { array: oppositeArray } =
          key === 'duplexFields'
            ? composeFieldsObject(currentConfig).fieldsObject[oppositeName]
            : { array: false };

        const childQueries = array
          ? [
              'childEntities',
              'childEntitiesThroughConnection',
              'childEntityCount',
              'childEntityDistinctValues',
            ]
          : key !== 'duplexFields' || required || oppositeArray
            ? ['childEntity']
            : ['childEntity', 'childEntityGetOrCreate'];
        if (
          !childQueries.some((childQuery: RepresentationAttributesActionName) =>
            representation[representationKey].allow[currentConfig.name].includes(childQuery),
          ) &&
          key !== 'childFields'
        ) {
          throw new TypeError(
            `Have to set ${childQueries
              .map((str) => `"${str}"`)
              .join(' or ')} as "allow" for representationKey: "${representationKey}" & entity: "${
              currentConfig.name
            }" to connect through "${name}" field!`,
          );
        }

        const config =
          store[`${currentConfig.name}${representationKey}`] ||
          composeRepresentationConfig(
            representation[representationKey],
            currentConfig,
            generalConfig,
          );
        if (!config) {
          throw new TypeError(
            `Can not set representation config for entityName: "${currentConfig.name}" & representation representationKey:"${representationKey}" to connect through "${name}" field!`,
          );
        }

        return { ...item, config };
      });

      // *** check that the relational fields have opposite relational fields

      if (key === 'relationalFields') {
        entityConfig[key]?.forEach(({ name, config, oppositeName }) => {
          const oppositeField = (config.relationalFields || []).find(
            ({ name: name2 }) => name2 === oppositeName,
          );

          if (!oppositeField) {
            throw new TypeError(
              `Expected a relationalField with name "${oppositeName}" in representation config "${config.name}" to connect through "${name}" field!`,
            );
          }
        });
      }

      // ***

      // *** check that the duplex fields have opposite duplex fields

      if (key === 'duplexFields') {
        entityConfig[key]?.forEach(({ config, oppositeName, name: name2 }) => {
          const oppositeField = (config.duplexFields || []).find(
            ({ name }) => name === oppositeName,
          );

          if (!oppositeField) {
            throw new TypeError(
              `Expected a duplexField with name "${oppositeName}" in representation config "${config.name}" to connect through "${name2}" field!`,
            );
          }
        });
      }

      // ***
    }
  });

  if (freezedFields[rootEntityName]) {
    Object.keys(entityConfig).forEach((key) => {
      if (key.endsWith('Fields')) {
        entityConfig[key] = entityConfig[key].map((field) =>
          freezedFields[rootEntityName].includes(field.name)
            ? { ...field, freeze: true }
            : { ...field, freeze: false },
        );
      }
    });
  }

  if (unfreezedFields[rootEntityName]) {
    Object.keys(entityConfig).forEach((key) => {
      if (key.endsWith('Fields')) {
        entityConfig[key] = entityConfig[key].map((field) =>
          unfreezedFields[rootEntityName].includes(field.name)
            ? { ...field, freeze: false }
            : { ...field, freeze: true },
        );
      }
    });
  }

  return store[representationEntityName];
};

export default composeRepresentationConfig;
