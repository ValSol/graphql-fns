import type { TangibleEntityConfig } from '@/tsTypes';
import type { PrepareBulkData, PreparedData } from '@/resolvers/tsTypes';

import processCreateInputData from '@/resolvers/mutations/processCreateInputData';
import composeDataToCreate from '../../createGetOrCreateEntityMutationResolver/resolverAttributes/composeDataToCreate';
import composeItems from './composeItems';
import composeUniqueKeys from './composeUniqueKeys';
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
  JSON.stringify(['where', sortKeys(whereOne || whereCompoundOne)]);

// found entities are not changed, not found ones are created; "mains" get entities in the order of items;...
// ... a not found entity is created once for several items (by the first of them, "data" of the rest...
// ... is not used) and all these items get it, if the items have the same selector or entities...
// ... created by them would have the same value of a unique field (or of fields of a unique compound...
// ... index), e.g. one item selects by "id" & sets "email" in "data", other one selects by this "email"
const prepareBulkData: PrepareBulkData = (resolverCreatorArg, resolverArg, prevPreparedData) => {
  const { entityConfig } = resolverCreatorArg;
  const { args } = resolverArg;

  const foundItems = foundItemsByResolverArg.get(resolverArg);

  if (!foundItems) {
    throw new TypeError('Not got found items of "getOrCreateManyEntities" from "getPrevious"!');
  }

  const items = composeItems(args);

  // "mains" got from "getPrevious" are the found entities in the order of items
  const { mains: previous } = prevPreparedData;

  let preparedData: PreparedData = { ...prevPreparedData, mains: [] };
  let j = 0;

  // index in "mains" of the entity created for the selector or unique key
  const createdIndexes: Record<string, number> = {};

  items.forEach((item, i) => {
    if (foundItems[i]) {
      preparedData.mains.push(previous[j]);
      j += 1;

      return;
    }

    const dataToCreate = composeDataToCreate(item, entityConfig);

    const keys = [composeWhereKey(item), ...composeUniqueKeys(dataToCreate, entityConfig)];

    const createdKey = keys.find((key) => createdIndexes[key] !== undefined);

    if (createdKey) {
      const index = createdIndexes[createdKey];

      // other keys of the item (e.g. its selector) also select the created entity
      keys.forEach((key) => {
        if (createdIndexes[key] === undefined) createdIndexes[key] = index;
      });

      preparedData.mains.push(preparedData.mains[index]);

      return;
    }

    keys.forEach((key) => {
      createdIndexes[key] = preparedData.mains.length;
    });

    preparedData = processCreateInputData(
      dataToCreate,
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
