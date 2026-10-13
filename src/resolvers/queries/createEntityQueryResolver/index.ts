import type {
  Context,
  GeneralConfig,
  InventoryChain,
  ServersideConfig,
  EntityConfig,
  GraphqlObject,
  SintheticResolverInfo,
  InvolvedFilter,
  GraphqlScalar,
  TangibleEntityConfig,
} from '@/tsTypes';

import checkInventory from '@/utils/inventory/checkInventory';
import createMongooseModel from '@/mongooseModels/createMongooseModel';
import adaptProjectionForCalculatedFields from '@/resolvers/utils/adaptProjectionForCalculatedFields';
import getCalculatedFieldsConfig from '@/resolvers/utils/getCalculatedFieldsConfig';
import removeCalculatedFieldValues from '@/resolvers/utils/removeCalculatedFieldValues';
import prepareCalculatedFields from '@/resolvers/utils/prepareCalculatedFields';
import addIdsToEntity from '@/resolvers/utils/addIdsToEntity';
import getFilterFromInvolvedFilters from '@/resolvers/utils/getFilterFromInvolvedFilters';
import composeAggregateHead from '@/resolvers/utils/mergeWhereAndFilter/composeAggregateHead';
import mergeWhereAndFilter from '@/resolvers/utils/mergeWhereAndFilter';
import getAsyncFuncResults from '@/resolvers/utils/getAsyncFuncResults';
import getInfoEssence from '@/resolvers/utils/getInfoEssence';
import checkWhereOneArgs from '@/resolvers/utils/checkWhereOneArgs';

type Args = {
  whereOne?: {
    id: string;
  };
  whereCompoundOne?: Record<string, any>;
};

const createEntityQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): any | null => {
  const { enums, inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain: InventoryChain = ['Query', 'entity', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (
    parent: null | GraphqlObject,
    args: Args,
    context: Context,
    info: SintheticResolverInfo,
    resolverOptions: {
      involvedFilters: {
        [representationConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
      };
      materializeCalculatedFields?: boolean;
      calculatedFieldsConfig?: EntityConfig;
    },
    session?: any,
  ): Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> => {
    const { involvedFilters } = resolverOptions;

    const { filter } = getFilterFromInvolvedFilters(involvedFilters);

    if (!filter) return null;

    const { whereOne, whereCompoundOne } = args;

    const { mongooseConn } = context;

    checkWhereOneArgs(whereOne, whereCompoundOne, entityConfig);

    const resolverArg = { parent, args, context, info, resolverOptions };

    const resolverCreatorArg = {
      entityConfig,
      generalConfig,
      serversideConfig,
      inAnyCase,
    };

    const infoEssence = getInfoEssence(entityConfig as TangibleEntityConfig, info);

    const calculatedFieldsConfig = getCalculatedFieldsConfig(resolverCreatorArg, resolverArg);

    const projection = adaptProjectionForCalculatedFields(
      infoEssence.projection,
      calculatedFieldsConfig,
      generalConfig,
      serversideConfig,
    );

    const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

    const { lookups, where: conditions } = mergeWhereAndFilter(
      filter,
      whereOne || whereCompoundOne,
      entityConfig,
    );

    if (lookups.length > 0) {
      const pipeline = composeAggregateHead({ where: conditions, lookups });

      pipeline.push({ $project: projection });

      const [preEntity] = await (session
        ? Entity.aggregate(pipeline).session(session).exec()
        : Entity.aggregate(pipeline).exec());

      if (!preEntity) return null;

      const entity = removeCalculatedFieldValues(preEntity, calculatedFieldsConfig);

      const asyncFuncResults = await getAsyncFuncResults(
        infoEssence,
        resolverCreatorArg,
        resolverArg,
        entity,
      );

      const entity2 = prepareCalculatedFields(
        addIdsToEntity(entity, entityConfig),
        infoEssence,
        asyncFuncResults,
        resolverArg,
        resolverCreatorArg,
        0, // index
      );
      return entity2;
    }

    const preEntity = await Entity.findOne(conditions, projection, { lean: true, session });

    if (!preEntity) return null;

    const entity = removeCalculatedFieldValues(preEntity, calculatedFieldsConfig);

    const asyncFuncResults = await getAsyncFuncResults(
      infoEssence,
      resolverCreatorArg,
      resolverArg,
      entity,
    );

    const entity2 = prepareCalculatedFields(
      addIdsToEntity(entity, entityConfig),
      infoEssence,
      asyncFuncResults,
      resolverArg,
      resolverCreatorArg,
      0, // index
    );
    return entity2;
  };

  return resolver;
};

export default createEntityQueryResolver;
