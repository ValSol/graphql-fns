// @flow
import type { DerivativeAttributes, GeneralConfig, ThingConfig } from '../flowTypes';

import composeFieldsObject from './composeFieldsObject';

const store = {};

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
  } = signatureMethods;

  const { derivative } = generalConfig;

  if (!allow[rootThingName]) return null;

  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[`${rootThingName}${suffix}`]) {
    return store[`${rootThingName}${suffix}`];
  }

  const fieldsObject = composeFieldsObject(rootThingConfig);

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
    const fieldsToAddObject = composeFieldsObject({
      ...addFields[rootThingName](generalConfig),
      name: `${rootThingName}${suffix}`,
    });

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

  if (!derivative) throw new TypeError('"derivative" attribute of generalConfig must be setted!');

  if (derivativeFields && derivativeFields[rootThingName]) {
    Object.keys(thingConfig).forEach((key) => {
      if (key === 'relationalFields' || key === 'duplexFields') {
        // $FlowFixMe
        thingConfig[key] = thingConfig[key].map((item) => {
          const { name, config: currentConfig } = item;
          if (!derivativeFields[rootThingName][name]) {
            // $FlowFixMe
            return item;
          }
          const suffix2 = derivativeFields[rootThingName][name];
          const config = store[`${currentConfig.name}${suffix2}`]
            ? store[`${currentConfig.name}${suffix2}`]
            : composeDerivativeConfig(derivative[suffix2], currentConfig, generalConfig);
          if (!config) {
            throw new TypeError('Can not set derivative config!');
          }

          // $FlowFixMe
          return { ...item, config };
        });
      }
    });
  }

  return store[`${rootThingName}${suffix}`];
};

export default composeDerivativeConfig;
