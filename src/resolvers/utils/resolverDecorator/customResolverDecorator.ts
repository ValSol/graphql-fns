import type {
  ActionSignatureMethods,
  EntityConfig,
  GeneralConfig,
  ServersideConfig,
  ThreeSegmentInventoryChain,
} from '@/tsTypes';

import authDecorator from './authDecorator';
import transformAfter from './transformAfter';
import transformBefore from './transformBefore';
import getTransformerAndConfig from './transformBefore/getTransformerAndConfig';
import createObjectBoundStore from '@/utils/createObjectBoundStore';

// separate cache for every combination of generalConfig, serversideConfig & signatureMethods
const getStore = createObjectBoundStore();

const customResolverDecorator = (
  func: any,
  inventoryChain: ThreeSegmentInventoryChain,
  signatureMethods: ActionSignatureMethods,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): any => {
  const obj = getStore(generalConfig, serversideConfig, signatureMethods);

  const { name } = entityConfig;

  if (!process.env.JEST_WORKER_ID && obj[name]) {
    return obj[name];
  }

  // transformers of the resolver args (use configs from THIS generalConfig)
  let argNamesToTransformers: null | Record<string, any> = null;

  obj[name] = async (...resolverArgs) => {
    const returnConfig = signatureMethods.config(entityConfig, generalConfig);
    const argNames = signatureMethods.argNames(entityConfig, generalConfig);
    const argTypes = signatureMethods.argTypes(entityConfig, generalConfig);

    if (process.env.JEST_WORKER_ID || !argNamesToTransformers) {
      argNamesToTransformers = argNames.reduce<Record<string, any>>((prev, argName, i) => {
        const argType = argTypes[i];

        const transformerAndConfig = getTransformerAndConfig(argType, generalConfig);

        if (transformerAndConfig) {
          prev[argName] = transformerAndConfig;
        }

        return prev;
      }, {});
    }

    const [parent, args, ...rest] = resolverArgs;

    const involvedEntityNames = signatureMethods.involvedEntityNames(entityConfig, generalConfig);

    const rawResult = await authDecorator(
      func,
      inventoryChain,
      involvedEntityNames,
      generalConfig,
      serversideConfig,
    )(parent, transformBefore(args, argNamesToTransformers), ...rest);

    if (!rawResult) return rawResult;

    if (Array.isArray(rawResult)) {
      return rawResult.map((item) => transformAfter(args, item, returnConfig, generalConfig));
    }

    return transformAfter(args, rawResult, returnConfig, generalConfig);
  };

  return obj[name];
};

export default customResolverDecorator;
