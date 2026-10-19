import type { TangibleEntityConfig } from '@/tsTypes';
import type { PrepareBulkData, PreparedData } from '@/resolvers/tsTypes';

import processCreateInputData from '@/resolvers/mutations/processCreateInputData';
import composeDataToCreate from '../../createGetOrCreateEntityMutationResolver/resolverAttributes/composeDataToCreate';
import composeItems from './composeItems';
import foundItemsByResolverArg from './foundItemsByResolverArg';

const sortKeys = (value: any): any =>
  value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)
    ? Object.keys(value)
        .sort()
        .reduce<Record<string, any>>((prev, key) => {
          prev[key] = sortKeys(value[key]);
          return prev;
        }, {})
    : value;

// the same key for items that select the same entity
const composeWhereKey = ({ whereOne, whereCompoundOne }: Record<string, any>) =>
  JSON.stringify(sortKeys(whereOne || whereCompoundOne));

// found entities are not changed, not found ones are created; "mains" get entities in the order of items;...
// ... a not found entity selected by several items is created once (by the first of them, "data" of...
// ... the rest is not used) and all these items get it
const prepareBulkData: PrepareBulkData = (resolverCreatorArg, resolverArg, prevPreparedData) => {
  const { entityConfig } = resolverCreatorArg;
  const { args } = resolverArg;

  const foundItems = foundItemsByResolverArg.get(resolverArg);

  if (!foundItems) {
    throw new TypeError('Not got found items of "getOrCreateEntities" from "getPrevious"!');
  }

  const items = composeItems(args);

  // "mains" got from "getPrevious" are the found entities in the order of items
  const { mains: previous } = prevPreparedData;

  let preparedData: PreparedData = { ...prevPreparedData, mains: [] };
  let j = 0;

  // index in "mains" of the entity created for the "where" key
  const createdIndexes: Record<string, number> = {};

  items.forEach((item, i) => {
    if (foundItems[i]) {
      preparedData.mains.push(previous[j]);
      j += 1;

      return;
    }

    const whereKey = composeWhereKey(item);

    if (createdIndexes[whereKey] !== undefined) {
      preparedData.mains.push(preparedData.mains[createdIndexes[whereKey]]);

      return;
    }

    createdIndexes[whereKey] = preparedData.mains.length;

    preparedData = processCreateInputData(
      composeDataToCreate(item, entityConfig),
      preparedData,
      entityConfig as TangibleEntityConfig,
      'create',
    );
  });

  // "previous" array is kept as "mains" because "workOutMutations" produces results from it
  previous.splice(0, previous.length, ...preparedData.mains);

  return { ...preparedData, mains: previous };
};

export default prepareBulkData;
