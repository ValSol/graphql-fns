import type {
  ActionAttributes,
  EntityConfig,
  GeneralConfig,
  ServersideConfig,
  ThreeSegmentInventoryChain,
} from '@/tsTypes';

import authDecorator from './authDecorator';
import transformAfter from './transformAfter';
import transformBefore from './transformBefore';
import transformData from './transformBefore/transformData';
import transformWhere from './transformBefore/transformWhere';
import transformWhereOne from './transformBefore/transformWhereOne';
import transformWhereKeyToSource from './transformBefore/transformWhereKeyToSource';
import createObjectBoundStore from '@/utils/createObjectBoundStore';

const argTypesPrefixPlusSuffixes = [
  // prefixPlusSuffix, transformer, notUseConfig
  ['CreateInput', transformData, true],
  ['PushIntoInput', transformData, true],
  ['UpdateInput', transformData, true],
  ['WhereInput', transformWhere, false],
  ['WhereByUniqueInput', transformWhere, false],
  ['WhereOneInput', transformWhereOne, false],
  ['WhereCompoundOneInput', transformWhere, false],
  ['WhereTargetInput', transformWhereOne, false],
  ['WhereKeyToSourceInput', transformWhereKeyToSource, false],
];

// separate cache for every combination of generalConfig, serversideConfig & actionAttributes
const getStore = createObjectBoundStore();

const regExp = /[\[\]\!]/g;

// compose transformers for args of the resolver (transformers use config of THIS entity)
const composeArgNamesToTransformers = (
  actionAttributes: ActionAttributes,
  entityConfig: EntityConfig,
): Record<string, any> => {
  const { argNames } = actionAttributes;
  const argTypesWithoutEntityNames = actionAttributes.argTypes.map((composer) =>
    composer({ ...entityConfig, name: '' }).replace(regExp, ''),
  );

  return argNames.reduce<Record<string, any>>((prev, argName, i) => {
    const argTypeWithoutEntityName = argTypesWithoutEntityNames[i];

    const argTypePrefixPlusSuffix = argTypesPrefixPlusSuffixes.find(
      ([prefixPlusSuffix]: [any]) => prefixPlusSuffix === argTypeWithoutEntityName,
    );

    if (!argTypePrefixPlusSuffix) return prev;

    const [, transformer, notUseConfig] = argTypePrefixPlusSuffix;

    prev[argName] = [transformer, notUseConfig ? null : entityConfig];

    return prev;
  }, {});
};

const resolverDecorator = (
  func: any,
  inventoryChain: ThreeSegmentInventoryChain,
  actionAttributes: ActionAttributes,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): any => {
  const obj = getStore(generalConfig, serversideConfig, actionAttributes);

  const { name } = entityConfig;

  if (!process.env.JEST_WORKER_ID && obj[name]) {
    return obj[name];
  }

  let argNamesToTransformers: null | Record<string, any> = null;

  obj[name] = async (...resolverArgs) => {
    const returnConfig = actionAttributes.actionReturnConfig(entityConfig, generalConfig);

    if (process.env.JEST_WORKER_ID || !argNamesToTransformers) {
      argNamesToTransformers = composeArgNamesToTransformers(actionAttributes, entityConfig);
    }

    const [parent, args, ...rest] = resolverArgs;

    const involvedEntityNames = actionAttributes.actionInvolvedEntityNames(name);

    const rawResult = await authDecorator(
      func,
      inventoryChain,
      involvedEntityNames,
      generalConfig,
      serversideConfig,
    )(parent, transformBefore(args, argNamesToTransformers), ...rest);

    if (!rawResult) return rawResult;

    if (Array.isArray(rawResult)) {
      return rawResult.map((item) => transformAfter(args, item, returnConfig, null));
    }

    return transformAfter(args, rawResult, returnConfig, null);
  };

  return obj[name];
};

export default resolverDecorator;
