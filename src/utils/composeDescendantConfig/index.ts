import type {
  DescendantAttributes,
  GeneralConfig,
  EntityConfig,
  EntityConfigObject,
  SimplifiedEntityConfig,
  SimplifiedTangibleEntityConfig,
  SimplifiedVirtualEntityConfig,
} from '../../tsTypes';

import composeFieldsObject from '../composeFieldsObject';
import composeEntityConfig from '../composeEntityConfig';
import composeDescendantConfigName from './composeDescendantConfigName';

const store = Object.create(null);

const checkAnyEntityNames =
  (allowEntityNames: Array<string>, descendantKey: string) =>
  (EntityNamesObject, fieldType: string) => {
    Object.keys(EntityNamesObject).forEach((entityName) => {
      if (!allowEntityNames.includes(entityName)) {
        throw new TypeError(
          `Incorrect entityName key: "${entityName}" in ${fieldType} of "${descendantKey}" descendant!`,
        );
      }
    });
  };

const checkAnyFieldNames =
  (rootEntityName: string, fieldsObject: EntityConfigObject, descendantKey: string) =>
  (
    EntityNamesObject:
      | Record<any, any>
      | {
          [entityName: string]: Array<string>;
        },
    fieldType: string,
  ) => {
    if (EntityNamesObject[rootEntityName]) {
      EntityNamesObject[rootEntityName].forEach((fieldName) => {
        if (!fieldsObject[fieldName]) {
          throw new TypeError(
            `Incorrect ${fieldType} field name "${fieldName}" for "${rootEntityName}" in: "${descendantKey}" descendant!`,
          );
        }
      });
    }
  };

const composeDescendantConfig = (
  signatureMethods: DescendantAttributes,
  rootEntityConfig: EntityConfig,
  generalConfig: GeneralConfig,
): null | EntityConfig => {
  const { name: rootEntityName, descendantNameSlicePosition } = rootEntityConfig;

  const {
    descendantKey,
    allow,
    addFields = {},
    descendantFields = {},
    excludeFields = {},
    includeFields = {},
    freezedFields = {},
    unfreezedFields = {},
  } = signatureMethods;

  const { descendant, allEntityConfigs } = generalConfig;

  if (!descendant) throw new TypeError('"descendant" attribute of generalConfig must be setted!');

  if (!allow[rootEntityName]) return null; // not error but negative result of function!

  const descendantEntityName = composeDescendantConfigName(
    rootEntityName,
    descendantKey,
    descendantNameSlicePosition,
  );

  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[descendantEntityName]) {
    return store[descendantEntityName];
  }

  const fieldsObject = composeFieldsObject(rootEntityConfig);

  const allowEntityNames = Object.keys(allow);

  const checkEntityNames = checkAnyEntityNames(allowEntityNames, descendantKey);
  const checkFieldNames = checkAnyFieldNames(rootEntityName, fieldsObject, descendantKey);

  // *** check args correctness

  checkEntityNames(excludeFields, 'excludeFields');
  checkFieldNames(excludeFields, 'excludeFields');

  checkEntityNames(includeFields, 'includeFields');
  checkFieldNames(includeFields, 'includeFields');

  checkEntityNames(freezedFields, 'freezedFields');
  checkFieldNames(freezedFields, 'freezedFields');

  checkEntityNames(unfreezedFields, 'unfreezedFields');
  checkFieldNames(unfreezedFields, 'unfreezedFields');

  checkEntityNames(addFields, 'addFields');

  checkEntityNames(descendantFields, 'descendantFields');

  type TangibleFields = Omit<SimplifiedTangibleEntityConfig, 'name' | 'type' | 'counter'>;

  const addedDuplexFields = (addFields[rootEntityName] as TangibleFields)?.duplexFields
    ? (addFields[rootEntityName] as TangibleFields).duplexFields.map(({ name }) => name)
    : [];

  const addedRelationalFields = (addFields[rootEntityName] as TangibleFields)?.relationalFields
    ? (addFields[rootEntityName] as TangibleFields).relationalFields.map(({ name }) => name)
    : [];

  type VirtualFields = Omit<SimplifiedVirtualEntityConfig, 'name' | 'type' | 'counter'>;

  const addedChildFields = (addFields[rootEntityName] as VirtualFields)?.childFields
    ? (addFields[rootEntityName] as VirtualFields).childFields.map(({ name }) => name)
    : [];

  if (descendantFields[rootEntityName]) {
    Object.keys(descendantFields[rootEntityName]).forEach((fieldName) => {
      if (
        !(
          fieldsObject[fieldName] &&
          (fieldsObject[fieldName].type === 'relationalFields' ||
            fieldsObject[fieldName].type === 'duplexFields' ||
            fieldsObject[fieldName].type === 'childFields')
        ) &&
        !addedDuplexFields.includes(fieldName) &&
        !addedRelationalFields.includes(fieldName) &&
        !addedChildFields.includes(fieldName)
      ) {
        throw new TypeError(
          `Incorrect descendantFields field name "${fieldName}" for "${rootEntityName}" in: "${descendantKey}" descendant!`,
        );
      }

      if (includeFields[rootEntityName] && !includeFields[rootEntityName].includes(fieldName)) {
        throw new TypeError(
          `Incorrect descendantFields field name "${fieldName}" for "${rootEntityName}" as not included in: "${descendantKey}" descendant!`,
        );
      }

      if (excludeFields[rootEntityName] && excludeFields[rootEntityName].includes(fieldName)) {
        throw new TypeError(
          `Incorrect descendantFields field name "${fieldName}" for "${rootEntityName}" as excluded in: "${descendantKey}" descendant!`,
        );
      }
    });
  }

  // ***

  const entityConfig = { ...rootEntityConfig, name: descendantEntityName };

  store[descendantEntityName] = entityConfig;

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
          // $FlowFixMe
          ({ name }) => !excludeFields[rootEntityName].includes(name),
        );
      }
    });
  }

  if (addFields[rootEntityName]) {
    const addFields2 = {
      ...addFields[rootEntityName],
      // name used also for cache results in composeFieldsObject util
      name: `fieldsToAdd ${descendantEntityName}`,
    };

    composeEntityConfig(
      addFields[rootEntityName] as SimplifiedEntityConfig,
      addFields2 as unknown as EntityConfig,
      allEntityConfigs,
    );

    const fieldsToAddObject = composeFieldsObject(addFields2 as unknown as EntityConfig);

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

  if (descendantFields[rootEntityName]) {
    Object.keys(entityConfig).forEach((key) => {
      if (key === 'relationalFields' || key === 'duplexFields' || key === 'childFields') {
        entityConfig[key] = entityConfig[key].map((item) => {
          const { name, array, config: currentConfig } = item;

          if (!descendantFields[rootEntityName][name]) {
            return item;
          }

          const descendantKey2 = descendantFields[rootEntityName][name];

          const childQuery = array ? 'childEntities' : 'childEntity';
          if (
            !descendant[descendantKey2].allow[currentConfig.name].includes(childQuery) &&
            key !== 'childFields'
          ) {
            throw new TypeError(
              `Have to set "${childQuery}" as "allow" for descendantKey: "${descendantKey2}" & entity: "${currentConfig.name}"!`,
            );
          }

          const config =
            store[`${currentConfig.name}${descendantKey2}`] ||
            composeDescendantConfig(descendant[descendantKey2], currentConfig, generalConfig);
          if (!config) {
            throw new TypeError(
              `Can not set descendant config for entityName: "${currentConfig.name}" & descendant descendantKey:"${descendantKey2}"!`,
            );
          }

          return { ...item, config };
        });

        // *** check that the duplex fields have opposite duplex fields

        if (key === 'duplexFields') {
          // eslint-disable-next-line
          entityConfig[key]?.forEach(({ config, oppositeName }) => {
            const oppositeField = (config.duplexFields || []).find(
              ({ name }) => name === oppositeName,
            );

            if (!oppositeField) {
              throw new TypeError(
                `Expected a duplexField with name "${oppositeName}" in descendant config "${config.name}"!`,
              );
            }
          });
        }

        // ***
      }
    });
  }

  if (freezedFields[rootEntityName]) {
    Object.keys(entityConfig).forEach((key) => {
      if (key.endsWith('Fields')) {
        entityConfig[key] = entityConfig[key].map((field) =>
          // $FlowFixMe
          freezedFields[rootEntityName].includes(field.name)
            ? // $FlowFixMe
              { ...field, freeze: true }
            : // $FlowFixMe
              { ...field, freeze: false },
        );
      }
    });
  }

  if (unfreezedFields[rootEntityName]) {
    Object.keys(entityConfig).forEach((key) => {
      if (key.endsWith('Fields')) {
        entityConfig[key] = entityConfig[key].map((field) =>
          // $FlowFixMe
          unfreezedFields[rootEntityName].includes(field.name)
            ? // $FlowFixMe
              { ...field, freeze: false }
            : // $FlowFixMe
              { ...field, freeze: true },
        );
      }
    });
  }

  return store[descendantEntityName];
};

export default composeDescendantConfig;
