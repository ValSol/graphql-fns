// @flow
import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../flowTypes';

import composeFieldsObject from './composeFieldsObject';
import composeThingConfig from './composeThingConfig';

const store = Object.create(null);

const composeDerivativeConfig = (
  signatureMethods: DerivativeAttributes,
  rootThingConfig: ThingConfig,
  generalConfig: GeneralConfig,
): null | ThingConfig => {
  const { name: rootThingName } = rootThingConfig;

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

  const { derivative, thingConfigs } = generalConfig;

  if (!derivative) throw new TypeError('"derivative" attribute of generalConfig must be setted!');

  if (!allow[rootThingName]) return null;

  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[`${rootThingName}${suffix}`]) {
    return store[`${rootThingName}${suffix}`];
  }

  const fieldsObject = composeFieldsObject(rootThingConfig);

  const allowThingNames = Object.keys(allow);

  // *** check args correctness

  if (excludeFields) {
    Object.keys(excludeFields).forEach((thingName) => {
      if (!allowThingNames.includes(thingName)) {
        throw new TypeError(
          `Incorrect thingName key: "${thingName}" in excludeFields of "${suffix}" derivative!`,
        );
      }
    });

    if (excludeFields[rootThingName]) {
      excludeFields[rootThingName].forEach((fieldName) => {
        if (!fieldsObject[fieldName]) {
          throw new TypeError(
            `Incorrect excludeFields field name "${fieldName}" for "${rootThingName}" in: "${suffix}" derivative!`,
          );
        }
      });
    }
  }

  if (includeFields) {
    Object.keys(includeFields).forEach((thingName) => {
      if (!allowThingNames.includes(thingName)) {
        throw new TypeError(
          `Incorrect thingName key: "${thingName}" in includeFields of "${suffix}" derivative!`,
        );
      }
    });

    if (includeFields[rootThingName]) {
      includeFields[rootThingName].forEach((fieldName) => {
        if (!fieldsObject[fieldName]) {
          throw new TypeError(
            `Incorrect includeFields field name "${fieldName}" for "${rootThingName}" in: "${suffix}" derivative!`,
          );
        }
      });
    }
  }

  if (freezedFields) {
    Object.keys(freezedFields).forEach((thingName) => {
      if (!allowThingNames.includes(thingName)) {
        throw new TypeError(
          `Incorrect thingName key: "${thingName}" in freezedFields of "${suffix}" derivative!`,
        );
      }
    });

    if (freezedFields[rootThingName]) {
      freezedFields[rootThingName].forEach((fieldName) => {
        if (!fieldsObject[fieldName]) {
          throw new TypeError(
            `Incorrect freezedFields field name "${fieldName}" for "${rootThingName}" in: "${suffix}" derivative!`,
          );
        }
      });
    }
  }

  if (unfreezedFields) {
    Object.keys(unfreezedFields).forEach((thingName) => {
      if (!allowThingNames.includes(thingName)) {
        throw new TypeError(
          `Incorrect thingName key: "${thingName}" in unfreezedFields of "${suffix}" derivative!`,
        );
      }
    });

    if (unfreezedFields[rootThingName]) {
      unfreezedFields[rootThingName].forEach((fieldName) => {
        if (!fieldsObject[fieldName]) {
          throw new TypeError(
            `Incorrect unfreezedFields field name "${fieldName}" for "${rootThingName}" in: "${suffix}" derivative!`,
          );
        }
      });
    }
  }

  if (addFields) {
    Object.keys(addFields).forEach((thingName) => {
      if (!allowThingNames.includes(thingName)) {
        throw new TypeError(
          `Incorrect thingName key: "${thingName}" in addFields of "${suffix}" derivative!`,
        );
      }
    });
  }

  if (derivativeFields) {
    Object.keys(derivativeFields).forEach((thingName) => {
      if (!allowThingNames.includes(thingName)) {
        throw new TypeError(
          `Incorrect thingName key: "${thingName}" in derivativeFields of "${suffix}" derivative!`,
        );
      }
    });

    const addedDuplexFields =
      addFields && addFields[rootThingName] && addFields[rootThingName].duplexFields
        ? addFields[rootThingName].duplexFields.map(({ name }) => name)
        : [];

    const addedRelationalFields =
      addFields && addFields[rootThingName] && addFields[rootThingName].relationalFields
        ? addFields[rootThingName].relationalFields.map(({ name }) => name)
        : [];

    if (derivativeFields[rootThingName]) {
      Object.keys(derivativeFields[rootThingName]).forEach((fieldName) => {
        if (
          !(
            fieldsObject[fieldName] &&
            (fieldsObject[fieldName].kind === 'relationalFields' ||
              fieldsObject[fieldName].kind === 'duplexFields')
          ) &&
          !addedDuplexFields.includes(fieldName) &&
          !addedRelationalFields.includes(fieldName)
        ) {
          throw new TypeError(
            `Incorrect derivativeFields field name "${fieldName}" for "${rootThingName}" in: "${suffix}" derivative!`,
          );
        }
      });
    }
  }

  // ***

  const thingConfig = { ...rootThingConfig, name: `${rootThingName}${suffix}` };

  store[`${rootThingName}${suffix}`] = thingConfig;

  if (includeFields && includeFields[rootThingName]) {
    Object.keys(thingConfig).forEach((key) => {
      if (key.slice(-6) === 'Fields') {
        // $FlowFixMe
        thingConfig[key] = thingConfig[key].filter(({ name }) =>
          includeFields[rootThingName].includes(name),
        );
      }
    });
  }

  if (excludeFields && excludeFields[rootThingName]) {
    Object.keys(thingConfig).forEach((key) => {
      if (key.slice(-6) === 'Fields') {
        // $FlowFixMe
        thingConfig[key] = thingConfig[key].filter(
          // $FlowFixMe
          ({ name }) => !excludeFields[rootThingName].includes(name),
        );
      }
    });
  }

  if (addFields && addFields[rootThingName]) {
    const addFields2 = {
      ...addFields[rootThingName],
      // name used also for cache results in composeFieldsObject util
      name: `fieldsToAdd ${rootThingName}${suffix}`,
    };

    // $FlowFixMe
    composeThingConfig(addFields[rootThingName], addFields2, thingConfigs);

    // $FlowFixMe
    const fieldsToAddObject = composeFieldsObject(addFields2);

    Object.keys(fieldsToAddObject).forEach((fieldName) => {
      if (fieldsObject[fieldName]) {
        const { kind } = fieldsObject[fieldName];
        // $FlowFixMe
        thingConfig[kind] = thingConfig[kind].filter(({ name }) => name !== fieldName);
      }
      const { kind, attributes: fieldToAdd } = fieldsToAddObject[fieldName];
      if (thingConfig[kind]) {
        // $FlowFixMe
        thingConfig[kind].push(fieldToAdd);
      } else {
        // $FlowFixMe
        thingConfig[kind] = [fieldToAdd];
      }
    });
  }

  if (derivativeFields && derivativeFields[rootThingName]) {
    Object.keys(thingConfig).forEach((key) => {
      if (key === 'relationalFields' || key === 'duplexFields') {
        // $FlowFixMe
        thingConfig[key] = thingConfig[key].map((item) => {
          const { name, array, config: currentConfig } = item;

          if (!derivativeFields[rootThingName][name]) {
            // $FlowFixMe
            return item;
          }

          const suffix2 = derivativeFields[rootThingName][name];

          const childQuery = array ? 'childThings' : 'childThing';
          if (!derivative[suffix2].allow[currentConfig.name].includes(childQuery)) {
            throw new TypeError(
              `Have to set "${childQuery}" as "allow" for suffix: "${suffix2}" & thing: "${currentConfig.name}"!`,
            );
          }

          const config =
            store[`${currentConfig.name}${suffix2}`] ||
            composeDerivativeConfig(derivative[suffix2], currentConfig, generalConfig);
          if (!config) {
            throw new TypeError(
              `Can not set derivative config for thingName: "${currentConfig.name}" & derivative suffix:"${suffix2}"!`,
            );
          }

          // $FlowFixMe
          return { ...item, config };
        });
      }
    });
  }

  if (freezedFields && freezedFields[rootThingName]) {
    Object.keys(thingConfig).forEach((key) => {
      if (key.slice(-6) === 'Fields') {
        // $FlowFixMe
        thingConfig[key] = thingConfig[key].map((field) =>
          // $FlowFixMe
          freezedFields[rootThingName].includes(field.name)
            ? // $FlowFixMe
              { ...field, freeze: true }
            : // $FlowFixMe
              { ...field, freeze: false },
        );
      }
    });
  }

  if (unfreezedFields && unfreezedFields[rootThingName]) {
    Object.keys(thingConfig).forEach((key) => {
      if (key.slice(-6) === 'Fields') {
        // $FlowFixMe
        thingConfig[key] = thingConfig[key].map((field) =>
          // $FlowFixMe
          unfreezedFields[rootThingName].includes(field.name)
            ? // $FlowFixMe
              { ...field, freeze: false }
            : // $FlowFixMe
              { ...field, freeze: true },
        );
      }
    });
  }

  return store[`${rootThingName}${suffix}`];
};

export default composeDerivativeConfig;
