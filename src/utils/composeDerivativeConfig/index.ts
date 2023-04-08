import type {
  DerivativeAttributes,
  GeneralConfig,
  EntityConfig,
  EntityConfigObject,
  SimplifiedEntityConfig,
  SimplifiedTangibleEntityConfig,
  SimplifiedVirtualEntityConfig,
} from '../../tsTypes';

import composeFieldsObject from '../composeFieldsObject';
import composeEntityConfig from '../composeEntityConfig';
import composeDerivativeConfigName from './composeDerivativeConfigName';

const store = Object.create(null);

const checkAnyEntityNames =
  (allowEntityNames: Array<string>, derivativeKey: string) =>
  (EntityNamesObject, fieldType: string) => {
    Object.keys(EntityNamesObject).forEach((entityName) => {
      if (!allowEntityNames.includes(entityName)) {
        throw new TypeError(
          `Incorrect entityName key: "${entityName}" in ${fieldType} of "${derivativeKey}" derivative!`,
        );
      }
    });
  };

const checkAnyFieldNames =
  (rootEntityName: string, fieldsObject: EntityConfigObject, derivativeKey: string) =>
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
            `Incorrect ${fieldType} field name "${fieldName}" for "${rootEntityName}" in: "${derivativeKey}" derivative!`,
          );
        }
      });
    }
  };

const composeDerivativeConfig = (
  signatureMethods: DerivativeAttributes,
  rootEntityConfig: EntityConfig,
  generalConfig: GeneralConfig,
): null | EntityConfig => {
  const { name: rootEntityName, derivativeNameSlicePosition } = rootEntityConfig;

  const {
    derivativeKey,
    allow,
    addFields = {},
    derivativeFields = {},
    excludeFields = {},
    includeFields = {},
    freezedFields = {},
    unfreezedFields = {},
  } = signatureMethods;

  const { derivative, allEntityConfigs } = generalConfig;

  if (!derivative) throw new TypeError('"derivative" attribute of generalConfig must be setted!');

  if (!allow[rootEntityName]) return null; // not error but negative result of function!

  const derivativeEntityName = composeDerivativeConfigName(
    rootEntityName,
    derivativeKey,
    derivativeNameSlicePosition,
  );

  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[derivativeEntityName]) {
    return store[derivativeEntityName];
  }

  const fieldsObject = composeFieldsObject(rootEntityConfig);

  const allowEntityNames = Object.keys(allow);

  const checkEntityNames = checkAnyEntityNames(allowEntityNames, derivativeKey);
  const checkFieldNames = checkAnyFieldNames(rootEntityName, fieldsObject, derivativeKey);

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

  checkEntityNames(derivativeFields, 'derivativeFields');

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

  if (derivativeFields[rootEntityName]) {
    Object.keys(derivativeFields[rootEntityName]).forEach((fieldName) => {
      if (
        !(
          fieldsObject[fieldName] &&
          (fieldsObject[fieldName].kind === 'relationalFields' ||
            fieldsObject[fieldName].kind === 'duplexFields' ||
            fieldsObject[fieldName].kind === 'childFields')
        ) &&
        !addedDuplexFields.includes(fieldName) &&
        !addedRelationalFields.includes(fieldName) &&
        !addedChildFields.includes(fieldName)
      ) {
        throw new TypeError(
          `Incorrect derivativeFields field name "${fieldName}" for "${rootEntityName}" in: "${derivativeKey}" derivative!`,
        );
      }

      if (includeFields[rootEntityName] && !includeFields[rootEntityName].includes(fieldName)) {
        throw new TypeError(
          `Incorrect derivativeFields field name "${fieldName}" for "${rootEntityName}" as not included in: "${derivativeKey}" derivative!`,
        );
      }

      if (excludeFields[rootEntityName] && excludeFields[rootEntityName].includes(fieldName)) {
        throw new TypeError(
          `Incorrect derivativeFields field name "${fieldName}" for "${rootEntityName}" as excluded in: "${derivativeKey}" derivative!`,
        );
      }
    });
  }

  // ***

  const entityConfig = { ...rootEntityConfig, name: derivativeEntityName };

  store[derivativeEntityName] = entityConfig;

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
      name: `fieldsToAdd ${derivativeEntityName}`,
    };

    composeEntityConfig(
      addFields[rootEntityName] as SimplifiedEntityConfig,
      addFields2 as unknown as EntityConfig,
      allEntityConfigs,
    );

    const fieldsToAddObject = composeFieldsObject(addFields2 as unknown as EntityConfig);

    Object.keys(fieldsToAddObject).forEach((fieldName) => {
      if (fieldsObject[fieldName]) {
        const { kind } = fieldsObject[fieldName];
        entityConfig[kind] = entityConfig[kind].filter(({ name }) => name !== fieldName);
      }
      const { kind, attributes: fieldToAdd } = fieldsToAddObject[fieldName];
      if (entityConfig[kind]) {
        entityConfig[kind].push(fieldToAdd);
      } else {
        entityConfig[kind] = [fieldToAdd];
      }
    });
  }

  if (derivativeFields[rootEntityName]) {
    Object.keys(entityConfig).forEach((key) => {
      if (key === 'relationalFields' || key === 'duplexFields' || key === 'childFields') {
        entityConfig[key] = entityConfig[key].map((item) => {
          const { name, array, config: currentConfig } = item;

          if (!derivativeFields[rootEntityName][name]) {
            return item;
          }

          const derivativeKey2 = derivativeFields[rootEntityName][name];

          const childQuery = array ? 'childEntities' : 'childEntity';
          if (
            !derivative[derivativeKey2].allow[currentConfig.name].includes(childQuery) &&
            key !== 'childFields'
          ) {
            throw new TypeError(
              `Have to set "${childQuery}" as "allow" for derivativeKey: "${derivativeKey2}" & entity: "${currentConfig.name}"!`,
            );
          }

          const config =
            store[`${currentConfig.name}${derivativeKey2}`] ||
            composeDerivativeConfig(derivative[derivativeKey2], currentConfig, generalConfig);
          if (!config) {
            throw new TypeError(
              `Can not set derivative config for entityName: "${currentConfig.name}" & derivative derivativeKey:"${derivativeKey2}"!`,
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
                `Expected a duplexField with name "${oppositeName}" in derivative config "${config.name}"!`,
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

  return store[derivativeEntityName];
};

export default composeDerivativeConfig;
