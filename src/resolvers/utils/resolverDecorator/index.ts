import type {
  ActionAttributes,
  EntityConfig,
  GeneralConfig,
  ServersideConfig,
  ThreeSegmentInventoryChain,
} from '../../../tsTypes';

import authDecorator from './authDecorator';
import transformAfter from './transformAfter';
import transformBefore from './transformBefore';
import transformData from './transformBefore/transformData';
import transformWhere from './transformBefore/transformWhere';
import transformWhereOne from './transformBefore/transformWhereOne';
import transformWhereOnes from './transformBefore/transformWhereOnes';

const argTypesPrefixPlusSuffixes = [
  // prefixPlusSuffix, transformer, notUseConfig
  ['CreateInput', transformData, true],
  ['PushIntoInput', transformData, true],
  ['UpdateInput', transformData, true],
  ['WhereInput', transformWhere, false],
  ['WhereByUniqueInput', transformWhere, false],
  ['WhereOneInput', transformWhereOne, false],
  ['WhereCompoundOneInput', transformWhere, false],
  ['WhereOneToCopyInput', transformWhereOne, false],
  ['CopyWhereOnesInput', transformWhereOnes, false],
];

const store = new Map();
const argNamesToTransformersStore: Record<string, any> = {};

const regExp = /[\[\]\!]/g;

const resolverDecorator = (
  func: any,
  inventoryChain: ThreeSegmentInventoryChain,
  actionAttributes: ActionAttributes,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): any => {
  if (!store.get(actionAttributes)) {
    store.set(actionAttributes, {});
  }

  const obj = store.get(actionAttributes);

  if (!obj) {
    // to prevent flow error
    throw new TypeError('Must be object!');
  }

  const { name } = entityConfig;

  if (!process.env.JEST_WORKER_ID && obj[name]) {
    return obj[name];
  }

  obj[name] = async (...resolverArgs) => {
    const returnConfig = actionAttributes.actionReturnConfig(entityConfig, generalConfig);
    const { argNames } = actionAttributes;
    const argTypesWithoutEntityNames = actionAttributes.argTypes.map((composer) =>
      composer({ ...entityConfig, name: '' }).replace(regExp, ''),
    );

    const argNamesToTransformersStoreKey = `${argNames.join('.')}-${argTypesWithoutEntityNames.join(
      '.',
    )}`;

    if (
      process.env.JEST_WORKER_ID ||
      !argNamesToTransformersStore[argNamesToTransformersStoreKey]
    ) {
      argNamesToTransformersStore[argNamesToTransformersStoreKey] = argNames.reduce<
        Record<string, any>
      >((prev, argName, i) => {
        const argTypeWithoutEntityName = argTypesWithoutEntityNames[i];

        const argTypePrefixPlusSuffix = argTypesPrefixPlusSuffixes.find(
          ([prefixPlusSuffix]: [any]) => prefixPlusSuffix === argTypeWithoutEntityName,
        );

        if (!argTypePrefixPlusSuffix) return prev;

        const [, transformer, notUseConfig] = argTypePrefixPlusSuffix;

        prev[argName] = [transformer, notUseConfig ? null : entityConfig];

        return prev;
      }, {});
    }

    const [parent, args, ...rest] = resolverArgs;

    const involvedEntityNames = actionAttributes.actionInvolvedEntityNames(name);

    const rawResult = await authDecorator(
      func,
      inventoryChain,
      involvedEntityNames,
      generalConfig,
      serversideConfig,
    )(
      parent,
      transformBefore(args, argNamesToTransformersStore[argNamesToTransformersStoreKey]),
      ...rest,
    );

    if (!rawResult) return rawResult;

    if (Array.isArray(rawResult)) {
      return rawResult.map((item) => transformAfter(args, item, returnConfig, null));
    }

    return transformAfter(args, rawResult, returnConfig, null);
  };

  return obj[name];
};

export default resolverDecorator;
