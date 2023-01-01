// @flow

import type { GeneralConfig, ServersideConfig, EntityConfig } from '../../../flowTypes';
import type { Context } from '../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createMongooseModel from '../../../mongooseModels/createMongooseModel';
import addIdsToEntity from '../../utils/addIdsToEntity';
import executeAuthorisation from '../../utils/executeAuthorisation';
import getProjectionFromInfo from '../../utils/getProjectionFromInfo';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';

type Args = { whereOne: { id: string } };

const createEntityQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function | null => {
  const { enums, inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain = ['Query', 'entity', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (
    parent: Object,
    args: Args,
    context: Context,
    info: Object,
    parentFilters: { [derivativeConfigName: string]: Array<Object> },
  ): Object => {
    const { foo: filter } = inAnyCase
      ? parentFilters
      : await executeAuthorisation(inventoryChain, context, serversideConfig);
    if (!filter) return null;

    const { whereOne } = args;

    const { mongooseConn } = context;

    const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

    const whereOneKeys = Object.keys(whereOne);
    if (whereOneKeys.length !== 1) {
      throw new TypeError('Expected exactly one key in whereOne arg!');
    }

    const projection = info ? getProjectionFromInfo(info) : { _id: 1 };

    const { lookups, where: conditions } = mergeWhereAndFilter(filter, whereOne, entityConfig);

    if (lookups.length) {
      const arg = [...lookups];

      if (Object.keys(conditions).length) {
        arg.push({ $match: conditions });
      }

      arg.push({ $project: projection });

      const [entity] = await Entity.aggregate(arg).exec();

      if (!entity) return null;

      const entity2 = addIdsToEntity(entity, entityConfig);
      return entity2;
    }

    const entity = await Entity.findOne(conditions, projection, { lean: true });

    if (!entity) return null;

    const entity2 = addIdsToEntity(entity, entityConfig);
    return entity2;
  };

  return resolver;
};

export default createEntityQueryResolver;
