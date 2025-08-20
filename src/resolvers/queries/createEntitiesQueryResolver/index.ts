import type {
  Context,
  GeneralConfig,
  InventoryChain,
  NearInput,
  ServersideConfig,
  EntityConfig,
  GraphqlObject,
  SintheticResolverInfo,
  GraphqlScalar,
  InvolvedFilter,
  TangibleEntityConfig,
} from '@/tsTypes';

import checkInventory from '@/utils/inventory/checkInventory';
import createMongooseModel from '@/mongooseModels/createMongooseModel';
import addCalculatedFieldsToEntity from '@/resolvers/utils/addCalculatedFieldsToEntity';
import addIdsToEntity from '@/resolvers/utils/addIdsToEntity';
import composeNearForAggregateInput from '@/resolvers/utils/composeNearForAggregateInput';
import createInfoEssence from '@/resolvers/utils/createInfoEssence';
import getAsyncFuncResults from '@/resolvers/utils/getAsyncFuncResults';
import getFilterFromInvolvedFilters from '@/resolvers/utils/getFilterFromInvolvedFilters';
import getInfoEssence from '@/resolvers/utils/getInfoEssence';
import mergeWhereAndFilter from '@/resolvers/utils/mergeWhereAndFilter';
import composeNearInput from '../utils/composeNearInput';
import getLimit from '../utils/getLimit';
import composeSortForAggregateInput from './composeSortForAggregateInput';
import composeSortInput from './composeSortInput';

type Args = {
  where?: any;
  near?: NearInput;
  sort?: {
    sortBy: Array<string>;
  };
  pagination?: {
    skip: number;
    first: number;
  };
  search?: string;
  // "objectIds_from_parent" used only to process the call from createEntityArrayResolver
  objectIds_from_parent?: Array<any>;
};

const createEntitiesQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
  session?: any,
): any => {
  const { enums, inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain: InventoryChain = ['Query', 'entities', name];
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
    const { filter, limit = Infinity } = getFilterFromInvolvedFilters(involvedFilters);

    if (!filter) return [];

    const {
      near,
      pagination,
      sort,
      where: preWhere,
      search: preSearch,
      objectIds_from_parent: objectIdsFromParent,
    } = args;

    let where = preWhere;
    let search = preSearch;

    if (Boolean(near) && Boolean(search)) {
      const {
        inputOutputEntity: [filters],
      } = involvedFilters;

      const { coordinates: center, geospatialField, maxDistance: radius } = near;

      if (radius !== undefined) {
        where = { AND: [preWhere, { [`${geospatialField}_withinSphere`]: { center, radius } }] };
      }

      const ids = await resolver(
        parent,
        { search, where },
        context,
        createInfoEssence({ _id: 1 }),
        { inputOutputEntity: [filters] },
      );

      where = { id_in: (ids as { id: string }[]).map(({ id }) => id) };
      search = undefined;
    }

    // very same code as ...
    // ...at: src/resolvers/queries/createEntitiesThroughConnectionQueryResolver/getShift/index.js

    const { mongooseConn } = context;

    const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

    const resolverArg = { parent, args, context, info, involvedFilters };

    const infoEssence = getInfoEssence(entityConfig as TangibleEntityConfig, info);

    const { projection } = infoEssence;

    const resolverCreatorArg = {
      entityConfig,
      generalConfig,
      serversideConfig,
      inAnyCase,
    };

    const asyncFuncResults = await getAsyncFuncResults(
      infoEssence,
      resolverCreatorArg,
      resolverArg,
    );

    const { lookups, where: where2 } = mergeWhereAndFilter(filter, where, entityConfig);

    if (lookups.length > 0 || objectIdsFromParent) {
      const pipeline = [...lookups];

      if (near) {
        const geoNear = composeNearForAggregateInput(near);

        pipeline.unshift({ $geoNear: geoNear });
      }

      if (search) {
        pipeline.unshift({ $sort: { score: { $meta: 'textScore' } } });
        pipeline.unshift({ $match: { $text: { $search: search } } });
      }

      if (Object.keys(where2).length > 0) {
        pipeline.push({ $match: where2 });
      }

      if (sort) {
        const { sortBy } = sort;
        const sortInputs = composeSortForAggregateInput(sortBy);
        Array.prototype.push.apply(pipeline, sortInputs);
      }

      if (objectIdsFromParent) {
        pipeline.push({
          $set: { index_from_parent_ids: { $indexOfArray: [objectIdsFromParent, '$_id'] } },
        });
        pipeline.push({ $sort: { index_from_parent_ids: 1 } });
      }

      if (pagination) {
        const { skip = 0, first } = pagination;

        if (skip > 0) {
          pipeline.push({ $skip: skip });
        }

        const limit2 = getLimit(limit, first);

        if (limit2 > 0) {
          pipeline.push({ $limit: limit2 });
        }
      } else if (limit !== Infinity) {
        pipeline.push({ $limit: limit });
      }

      if (!search) {
        // not use "$project" if used "search" to prevent error: field names may not start with '$'
        pipeline.push({ $project: projection as { [fieldName: string]: 1 } });
      }

      const entities = await (session
        ? Entity.aggregate(pipeline).session(session).exec()
        : Entity.aggregate(pipeline).exec());

      if (!entities) return [];

      const result = entities.map((item, i) =>
        addCalculatedFieldsToEntity(
          addIdsToEntity(item, entityConfig),
          infoEssence,
          asyncFuncResults,
          resolverArg,
          entityConfig as TangibleEntityConfig,
          i,
        ),
      );

      return result;
    }

    let query = Entity.find({}, projection, { lean: true });

    if (near) query = query.where(composeNearInput(near));

    if (Object.keys(where2).length > 0) query = query.where(where2);

    if (search) query = query.where({ $text: { $search: search } });

    if (sort) {
      const { sortBy } = sort;
      const composedSortBy = composeSortInput(sortBy);
      composedSortBy.forEach((sortItem) => query.sort(sortItem));
    }

    if (pagination) {
      const { skip = 0, first } = pagination;

      query = query.skip(skip);

      const limit2 = getLimit(limit, first);

      if (limit2) {
        query = query.limit(limit2);
      }
    } else if (limit !== Infinity) {
      query = query.limit(limit);
    }

    const entities = await (session ? query.session(session).exec() : query.exec());
    if (!entities) return [];

    const result = entities.map((item, i) =>
      addCalculatedFieldsToEntity(
        addIdsToEntity(item, entityConfig),
        infoEssence,
        asyncFuncResults,
        resolverArg,
        entityConfig as TangibleEntityConfig,
        i,
      ),
    );

    return result;
  };

  return resolver;
};

export default createEntitiesQueryResolver;
