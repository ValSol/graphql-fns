// @flow
import type { DerivativeAttributes, GeneralConfig, EntityConfig } from '../flowTypes';

import composeFieldsObject from './composeFieldsObject';
import composeEntityConfig from './composeEntityConfig';

const store = Object.create(null);

const composeDerivativeConfig = (
  signatureMethods: DerivativeAttributes,
  rootEntityConfig: EntityConfig,
  generalConfig: GeneralConfig,
): null | EntityConfig => {
  const { name: rootEntityName } = rootEntityConfig;

  const {
    suffix,
    allow,
    addFields,
    derivativeFields,
    excludeFields,
    includeFields,
    freezedFields,
    unfreezedFields,
  } = signatureMethods;

  const { derivative, allEntityConfigs } = generalConfig;

  if (!derivative) throw new TypeError('"derivative" attribute of generalConfig must be setted!');

  if (!allow[rootEntityName]) return null; // not error but negative result of function!

  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[`${rootEntityName}${suffix}`]) {
    return store[`${rootEntityName}${suffix}`];
  }

  const fieldsObject = composeFieldsObject(rootEntityConfig);

  const allowEntityNames = Object.keys(allow);

  // *** check args correctness

  if (excludeFields) {
    Object.keys(excludeFields).forEach((entityName) => {
      if (!allowEntityNames.includes(entityName)) {
        throw new TypeError(
          `Incorrect entityName key: "${entityName}" in excludeFields of "${suffix}" derivative!`,
        );
      }
    });

    if (excludeFields[rootEntityName]) {
      excludeFields[rootEntityName].forEach((fieldName) => {
        if (!fieldsObject[fieldName]) {
          throw new TypeError(
            `Incorrect excludeFields field name "${fieldName}" for "${rootEntityName}" in: "${suffix}" derivative!`,
          );
        }
      });
    }
  }

  if (includeFields) {
    Object.keys(includeFields).forEach((entityName) => {
      if (!allowEntityNames.includes(entityName)) {
        throw new TypeError(
          `Incorrect entityName key: "${entityName}" in includeFields of "${suffix}" derivative!`,
        );
      }
    });

    if (includeFields[rootEntityName]) {
      includeFields[rootEntityName].forEach((fieldName) => {
        if (!fieldsObject[fieldName]) {
          throw new TypeError(
            `Incorrect includeFields field name "${fieldName}" for "${rootEntityName}" in: "${suffix}" derivative!`,
          );
        }
      });
    }
  }

  if (freezedFields) {
    Object.keys(freezedFields).forEach((entityName) => {
      if (!allowEntityNames.includes(entityName)) {
        throw new TypeError(
          `Incorrect entityName key: "${entityName}" in freezedFields of "${suffix}" derivative!`,
        );
      }
    });

    if (freezedFields[rootEntityName]) {
      freezedFields[rootEntityName].forEach((fieldName) => {
        if (!fieldsObject[fieldName]) {
          throw new TypeError(
            `Incorrect freezedFields field name "${fieldName}" for "${rootEntityName}" in: "${suffix}" derivative!`,
          );
        }
      });
    }
  }

  if (unfreezedFields) {
    Object.keys(unfreezedFields).forEach((entityName) => {
      if (!allowEntityNames.includes(entityName)) {
        throw new TypeError(
          `Incorrect entityName key: "${entityName}" in unfreezedFields of "${suffix}" derivative!`,
        );
      }
    });

    if (unfreezedFields[rootEntityName]) {
      unfreezedFields[rootEntityName].forEach((fieldName) => {
        if (!fieldsObject[fieldName]) {
          throw new TypeError(
            `Incorrect unfreezedFields field name "${fieldName}" for "${rootEntityName}" in: "${suffix}" derivative!`,
          );
        }
      });
    }
  }

  if (addFields) {
    Object.keys(addFields).forEach((entityName) => {
      if (!allowEntityNames.includes(entityName)) {
        throw new TypeError(
          `Incorrect entityName key: "${entityName}" in addFields of "${suffix}" derivative!`,
        );
      }
    });
  }

  if (derivativeFields) {
    Object.keys(derivativeFields).forEach((entityName) => {
      if (!allowEntityNames.includes(entityName)) {
        throw new TypeError(
          `Incorrect entityName key: "${entityName}" in derivativeFields of "${suffix}" derivative!`,
        );
      }
    });

    const addedDuplexFields = addFields?.[rootEntityName]?.duplexFields
      ? addFields[rootEntityName].duplexFields.map(({ name }) => name)
      : [];

    const addedRelationalFields = addFields?.[rootEntityName]?.relationalFields
      ? addFields[rootEntityName].relationalFields.map(({ name }) => name)
      : [];

    const addedChildFields = addFields?.[rootEntityName]?.childFields
      ? addFields[rootEntityName].childFields.map(({ name }) => name)
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
            `Incorrect derivativeFields field name "${fieldName}" for "${rootEntityName}" in: "${suffix}" derivative!`,
          );
        }
      });
    }
  }

  // ***

  const entityConfig = { ...rootEntityConfig, name: `${rootEntityName}${suffix}` };

  store[`${rootEntityName}${suffix}`] = entityConfig;

  if (includeFields && includeFields[rootEntityName]) {
    Object.keys(entityConfig).forEach((key) => {
      if (key.endsWith('Fields')) {
        // $FlowFixMe
        entityConfig[key] = entityConfig[key].filter(({ name }) =>
          includeFields[rootEntityName].includes(name),
        );
      }
    });
  }

  if (excludeFields && excludeFields[rootEntityName]) {
    Object.keys(entityConfig).forEach((key) => {
      if (key.endsWith('Fields')) {
        // $FlowFixMe
        entityConfig[key] = entityConfig[key].filter(
          // $FlowFixMe
          ({ name }) => !excludeFields[rootEntityName].includes(name),
        );
      }
    });
  }

  if (addFields && addFields[rootEntityName]) {
    const addFields2 = {
      ...addFields[rootEntityName],
      // name used also for cache results in composeFieldsObject util
      name: `fieldsToAdd ${rootEntityName}${suffix}`,
    };

    // $FlowFixMe
    composeEntityConfig(addFields[rootEntityName], addFields2, allEntityConfigs);

    // $FlowFixMe
    const fieldsToAddObject = composeFieldsObject(addFields2);

    Object.keys(fieldsToAddObject).forEach((fieldName) => {
      if (fieldsObject[fieldName]) {
        const { kind } = fieldsObject[fieldName];
        // $FlowFixMe
        entityConfig[kind] = entityConfig[kind].filter(({ name }) => name !== fieldName);
      }
      const { kind, attributes: fieldToAdd } = fieldsToAddObject[fieldName];
      if (entityConfig[kind]) {
        // $FlowFixMe
        entityConfig[kind].push(fieldToAdd);
      } else {
        // $FlowFixMe
        entityConfig[kind] = [fieldToAdd];
      }
    });
  }

  if (derivativeFields && derivativeFields[rootEntityName]) {
    Object.keys(entityConfig).forEach((key) => {
      if (key === 'relationalFields' || key === 'duplexFields' || key === 'childFields') {
        // $FlowFixMe
        entityConfig[key] = entityConfig[key].map((item) => {
          const { name, array, config: currentConfig } = item;

          if (!derivativeFields[rootEntityName][name]) {
            // $FlowFixMe
            return item;
          }

          const suffix2 = derivativeFields[rootEntityName][name];

          const childQuery = array ? 'childEntities' : 'childEntity';
          if (
            !derivative[suffix2].allow[currentConfig.name].includes(childQuery) &&
            fieldsObject[name].kind !== 'childFields'
          ) {
            throw new TypeError(
              `Have to set "${childQuery}" as "allow" for suffix: "${suffix2}" & entity: "${currentConfig.name}"!`,
            );
          }

          const config =
            store[`${currentConfig.name}${suffix2}`] ||
            composeDerivativeConfig(derivative[suffix2], currentConfig, generalConfig);
          if (!config) {
            throw new TypeError(
              `Can not set derivative config for entityName: "${currentConfig.name}" & derivative suffix:"${suffix2}"!`,
            );
          }

          // $FlowFixMe
          return { ...item, config };
        });
      }
    });
  }

  if (freezedFields && freezedFields[rootEntityName]) {
    Object.keys(entityConfig).forEach((key) => {
      if (key.endsWith('Fields')) {
        // $FlowFixMe
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

  if (unfreezedFields && unfreezedFields[rootEntityName]) {
    Object.keys(entityConfig).forEach((key) => {
      if (key.endsWith('Fields')) {
        // $FlowFixMe
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

  return store[`${rootEntityName}${suffix}`];
};

export default composeDerivativeConfig;
