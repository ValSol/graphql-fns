import type {
  Context,
  GeneralConfig,
  InventoryСhain,
  ServersideConfig,
  EntityConfig,
  GraphqlObject,
  SintheticResolverInfo,
  InvolvedFilter,
  GraphqlScalar,
  TangibleEntityConfig,
} from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createMongooseModel from '../../../mongooseModels/createMongooseModel';
import addCalculatedFieldsToEntity from '../../utils/addCalculatedFieldsToEntity';
import addIdsToEntity from '../../utils/addIdsToEntity';
import getFilterFromInvolvedFilters from '../../utils/getFilterFromInvolvedFilters';
import getProjectionFromInfo from '../../utils/getProjectionFromInfo';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';
import getAsyncFuncResults from '../../utils/getAsyncFuncResults';

type Args = {
  whereOne: {
    id: string;
  };
};

const createEntityQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): any | null => {
  const { enums, inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain: InventoryСhain = ['Query', 'entity', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (
    parent: null | GraphqlObject,
    args: Args,
    context: Context,
    info: SintheticResolverInfo,
    involvedFilters: {
      [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
    },
  ): Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> => {
    const { filter } = getFilterFromInvolvedFilters(involvedFilters);

    if (!filter) return null;

    const { whereOne } = args;

    const { mongooseConn } = context;

    const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

    const whereOneKeys = Object.keys(whereOne);
    if (whereOneKeys.length !== 1) {
      throw new TypeError('Expected exactly one key in whereOne arg!');
    }

    const resolverArg = { parent, args, context, info, involvedFilters };

    const projection: { [fieldName: string]: 1 } = getProjectionFromInfo(
      entityConfig as TangibleEntityConfig,
      resolverArg,
    );

    const asyncFuncResults = await getAsyncFuncResults(
      projection,
      resolverArg,
      entityConfig as TangibleEntityConfig,
    );

    const { lookups, where: conditions } = mergeWhereAndFilter(filter, whereOne, entityConfig);

    if (lookups.length > 0) {
      const pipeline = [...lookups];

      if (Object.keys(conditions).length > 0) {
        pipeline.push({ $match: conditions });
      }

      pipeline.push({ $project: projection });

      const [entity] = await Entity.aggregate(pipeline).exec();

      if (!entity) return null;

      const entity2 = addCalculatedFieldsToEntity(
        addIdsToEntity(entity, entityConfig),
        projection,
        asyncFuncResults,
        resolverArg,
        entityConfig as TangibleEntityConfig,
      );
      return entity2;
    }

    const entity = await Entity.findOne(conditions, projection, { lean: true });

    if (!entity) return null;

    const entity2 = addCalculatedFieldsToEntity(
      addIdsToEntity(entity, entityConfig),
      projection,
      asyncFuncResults,
      resolverArg,
      entityConfig as TangibleEntityConfig,
    );
    return entity2;
  };

  return resolver;
};

export default createEntityQueryResolver;
