import type { EntityConfig, GraphqlObject } from '../../../../tsTypes';

import transformData from './transformData';
import transformWhere from './transformWhere';
import transformWhereKeyToSource from './transformWhereKeyToSource';
import transformWhereOne from './transformWhereOne';

// every input paired in an item is transformed as the same standalone arg
const keysToTransformers: Record<string, (value: any, entityConfig: EntityConfig) => any> = {
  whereOne: transformWhereOne,
  whereCompoundOne: transformWhere,
  whereKeyToSource: transformWhereKeyToSource,
  whereTarget: transformWhereOne,
  whereCompoundTarget: transformWhere,
  data: transformData,
};

const processItem = (item: GraphqlObject, entityConfig: EntityConfig): GraphqlObject =>
  Object.keys(item).reduce<GraphqlObject>((prev, key) => {
    const transformer = keysToTransformers[key];

    prev[key] =
      transformer && item[key] !== null && item[key] !== undefined
        ? transformer(item[key], entityConfig)
        : item[key];

    return prev;
  }, {});

// items of "whereOneAndData", "whereCompoundOneAndData" ("updateManyXs") & "sourceAnd…Target…"...
// ... ("copyManyXs…") args
const transformPairedItems = (
  items: GraphqlObject | GraphqlObject[],
  entityConfig: EntityConfig,
): GraphqlObject | GraphqlObject[] => {
  if (Array.isArray(items)) {
    return items.map((item) => processItem(item, entityConfig));
  }

  return processItem(items, entityConfig);
};

export default transformPairedItems;
