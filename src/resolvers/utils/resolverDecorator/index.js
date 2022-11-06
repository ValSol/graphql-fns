// @flow

import type { ActionAttributes, ThingConfig } from '../../../flowTypes';

import transformAfter from './transformAfter';
import transformBefore from './transformBefore';
import transformData from './transformBefore/transformData';
import transformFileWhere from './transformBefore/transformFileWhere';
import transformFileWhereOne from './transformBefore/transformFileWhereOne';
import transformWhere from './transformBefore/transformWhere';
import transformWhereOne from './transformBefore/transformWhereOne';
import transformWhereOnes from './transformBefore/transformWhereOnes';

const argTypesPrefixPlusSuffixes = [
  // prefixPlusSuffix, transformer, notUseConfig
  ['CreateInput', transformData, true],
  ['PushIntoInput', transformData, true],
  ['UpdateInput', transformData, true],
  ['UploadFilesToInput', transformData, true],
  ['WhereInput', transformWhere, false],
  ['FileWhereInputFileWhereInput', transformFileWhere, true],
  ['WhereByUniqueInput', transformWhere, false],
  ['WhereOneInput', transformWhereOne, false],
  ['WhereOneToCopyInput', transformWhereOne, false],
  ['FileWhereOneInputFileWhereOneInput', transformFileWhereOne, true],
  ['CopyWhereOnesInput', transformWhereOnes, false],
];

const store = new Map();
const argNamesToTransformersStore = {};

const regExp = /[\[\]\!]/g; // eslint-disable-line no-useless-escape

const resolverDecorator = (
  func: Function,
  actionAttributes: ActionAttributes,
  thingConfig: ThingConfig,
): Function => {
  if (!store.get(actionAttributes)) {
    store.set(actionAttributes, {});
  }

  const obj = store.get(actionAttributes);

  if (!obj) {
    // to prevent flow error
    throw new TypeError('Must be object!');
  }

  const { name } = thingConfig;

  if (!process.env.JEST_WORKER_ID && obj[name]) {
    return obj[name];
  }

  obj[name] = async (...resolverArgs) => {
    const returnConfig = actionAttributes.actionReturnConfig ? thingConfig : null;
    const { argNames } = actionAttributes;
    const argTypesWithoutThingNames = actionAttributes.argTypes.map((composer) =>
      composer('').replace(regExp, ''),
    );

    const argNamesToTransformersStoreKey = `${argNames.join('.')}-${argTypesWithoutThingNames.join(
      '.',
    )}`;

    if (
      process.env.JEST_WORKER_ID ||
      !argNamesToTransformersStore[argNamesToTransformersStoreKey]
    ) {
      argNamesToTransformersStore[argNamesToTransformersStoreKey] = argNames.reduce(
        (prev, argName, i) => {
          const argTypeWithoutThingName = argTypesWithoutThingNames[i];

          const argTypePrefixPlusSuffix = argTypesPrefixPlusSuffixes.find(
            ([prefixPlusSuffix]) => prefixPlusSuffix === argTypeWithoutThingName,
          );

          if (!argTypePrefixPlusSuffix) return prev;

          const [, transformer, notUseConfig] = argTypePrefixPlusSuffix;

          prev[argName] = [transformer, notUseConfig ? null : thingConfig]; // eslint-disable-line no-param-reassign

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
      return rawResult.map((item) => transformAfter(item, returnConfig, null));
    }

    return transformAfter(rawResult, returnConfig, null);
  };

  return obj[name];
};

export default resolverDecorator;
