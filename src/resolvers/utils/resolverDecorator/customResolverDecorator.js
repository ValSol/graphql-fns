// @flow

import type { ActionSignatureMethods, GeneralConfig, ThingConfig } from '../../../flowTypes';

import transformAfter from './transformAfter';
import transformBefore from './transformBefore';
import getTransformerAndConfig from './transformBefore/getTransformerAndConfig';

const store = new Map();
const argNamesToTransformersStore = {};

const customResolverDecorator = (
  func: Function,
  signatureMethods: ActionSignatureMethods,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
): Function => {
  if (!store.get(signatureMethods)) {
    store.set(signatureMethods, {});
  }

  const obj = store.get(signatureMethods);

  if (!obj) {
    // to prevent flow error
    throw new TypeError('Must be object!');
  }

  const { name } = thingConfig;

  if (!process.env.JEST_WORKER_ID && obj[name]) {
    return obj[name];
  }

  obj[name] = async (...resolverArgs) => {
    const returnConfig = signatureMethods.config(thingConfig, generalConfig);
    const argNames = signatureMethods.argNames(thingConfig, generalConfig);
    const argTypes = signatureMethods.argTypes(thingConfig, generalConfig);

    const argNamesToTransformersStoreKey = `${argNames.join('.')}-${argTypes.join('.')}`;

    if (
      process.env.JEST_WORKER_ID ||
      !argNamesToTransformersStore[argNamesToTransformersStoreKey]
    ) {
      argNamesToTransformersStore[argNamesToTransformersStoreKey] = argNames.reduce(
        (prev, argName, i) => {
          const argType = argTypes[i];

          const transformerAndConfig = getTransformerAndConfig(argType, generalConfig);

          if (transformerAndConfig) {
            prev[argName] = transformerAndConfig; // eslint-disable-line no-param-reassign
          }

          return prev;
        },
        {},
      );
    }

    const [parent, args, ...rest] = resolverArgs;

    const rawResult = await func(
      parent,
      transformBefore(args, argNamesToTransformersStore[argNamesToTransformersStoreKey]),
      ...rest,
    );

    if (!rawResult) return null;

    if (Array.isArray(rawResult)) {
      return rawResult.map((item) => transformAfter(item, returnConfig, generalConfig));
    }

    return transformAfter(rawResult, returnConfig, generalConfig);
  };

  return obj[name];
};

export default customResolverDecorator;
