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
import adaptProjectionForCalculatedFields from '@/resolvers/utils/adaptProjectionForCalculatedFields';
import getCalculatedFieldsConfig from '@/resolvers/utils/getCalculatedFieldsConfig';
import removeCalculatedFieldValues from '@/resolvers/utils/removeCalculatedFieldValues';
import prepareCalculatedFields from '@/resolvers/utils/prepareCalculatedFields';
import addIdsToEntity from '@/resolvers/utils/addIdsToEntity';
import composeNearForAggregateInput from '@/resolvers/utils/composeNearForAggregateInput';
import createInfoEssence from '@/resolvers/utils/createInfoEssence';
import getAsyncFuncResults from '@/resolvers/utils/getAsyncFuncResults';
import getFilterFromInvolvedFilters from '@/resolvers/utils/getFilterFromInvolvedFilters';
import getInfoEssence from '@/resolvers/utils/getInfoEssence';
import composeAggregateHead from '@/resolvers/utils/mergeWhereAndFilter/composeAggregateHead';
import mergeWhereAndFilter from '@/resolvers/utils/mergeWhereAndFilter';
import composeNearInput from '../utils/composeNearInput';
import getLimit from '../utils/getLimit';
import parseSortKey from '../utils/parseSortKey';
import narrowGeoNearToPage from './narrowGeoNearToPage';
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
  // "keysetFilter_from_connection" (a MongoDB filter) used only to process the call from a connection
  keysetFilter_from_connection?: Record<string, any>;
};

const createEntitiesQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
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

    const { filter, limit = Infinity } = getFilterFromInvolvedFilters(involvedFilters);

    if (!filter) return [];

    const {
      near,
      pagination,
      sort,
      where: preWhere,
      search: preSearch,
      objectIds_from_parent: objectIdsFromParent,
      keysetFilter_from_connection: keysetFilter,
    } = args;

    let where = preWhere;
    let search = preSearch;

    if (Boolean(near) && Boolean(search)) {
      const {
        inputOutputFilterAndLimit: [filters],
      } = involvedFilters;

      const { coordinates: center, geospatialField, maxDistance: radius } = near;

      if (radius !== undefined) {
        where = { AND: [preWhere, { [`${geospatialField}_withinSphere`]: { center, radius } }] };
      }

      const ids = await resolver(
        parent,
        { search, where },
        context,
        createInfoEssence({ projection: { _id: 1 } }),
        { involvedFilters: { inputOutputFilterAndLimit: [filters] } },
      );

      where = { id_in: (ids as { id: string }[]).map(({ id }) => id) };
      search = undefined;
    }

    // very same code as ...
    // ...at: src/resolvers/queries/createEntitiesThroughConnectionQueryResolver/getShift/index.js

    const { mongooseConn } = context;

    const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

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

    const { lookups, where: preWhere2 } = mergeWhereAndFilter(filter, where, entityConfig);

    // with "near" the keyset condition of a connection may use the distance that "$geoNear" adds, so it's
    // matched after "$geoNear" (not in its "query"), otherwise it's a part of "where"
    const keysetAfterGeoNear = Boolean(near) && Boolean(keysetFilter);

    const where2 =
      keysetFilter && !near
        ? Object.keys(preWhere2).length > 0
          ? { $and: [preWhere2, keysetFilter] }
          : keysetFilter
        : preWhere2;

    // without "sort" documents come in the order of the distance and the ones at the same distance
    // in the order of "_id" (a connection sorts by "<geospatialField>_distance" explicitly): only
    // an aggregate sorts by the distance ("$nearSphere" doesn't add keys)
    const sortBy = sort?.sortBy.length
      ? sort.sortBy
      : near && !objectIdsFromParent
        ? [`${near.geospatialField}_distance_ASC`, 'id_ASC']
        : undefined;

    const [firstSortField, firstSortDirection] = sortBy ? parseSortKey(sortBy[0]) : [];

    const sortByDistance = Boolean(near) && firstSortField === `${near?.geospatialField}_distance`;

    if (lookups.length > 0 || objectIdsFromParent || sortByDistance || keysetAfterGeoNear) {
      let geoNear = near ? composeNearForAggregateInput(near, entityConfig) : undefined;

      const keysetStages = keysetAfterGeoNear
        ? [{ $match: keysetFilter as Record<string, any> }]
        : [];

      // "$geoNear" gives the documents by the ascending distance
      if (geoNear && sortByDistance && firstSortDirection === 1) {
        const { skip = 0, first = undefined } = pagination || {};

        const limit2 = getLimit(limit, first);

        if (limit2 > 0) {
          geoNear = await narrowGeoNearToPage(
            Entity,
            { where: where2, lookups, geoNear, stages: keysetStages },
            skip + limit2,
            session,
          );
        }
      }

      const pipeline = composeAggregateHead({
        where: where2,
        lookups,
        geoNear,
        search,
        sortByTextScore: true,
      });

      pipeline.push(...keysetStages);

      if (sortBy) {
        pipeline.push(composeSortForAggregateInput(sortBy));
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

      const preEntities = await (session
        ? Entity.aggregate(pipeline).session(session).exec()
        : Entity.aggregate(pipeline).exec());

      if (!preEntities) return [];

      const entities = preEntities.map((item) =>
        removeCalculatedFieldValues(item, calculatedFieldsConfig),
      );

      const asyncFuncResults = await getAsyncFuncResults(
        infoEssence,
        resolverCreatorArg,
        resolverArg,
        entities,
      );

      const result = entities.map((item, i) =>
        prepareCalculatedFields(
          addIdsToEntity(item, entityConfig),
          infoEssence,
          asyncFuncResults,
          resolverArg,
          resolverCreatorArg,
          i,
        ),
      );

      return result;
    }

    let query = Entity.find({}, projection, { lean: true });

    if (near) query = query.where(composeNearInput(near, entityConfig));

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

    const preEntities = await (session ? query.session(session).exec() : query.exec());
    if (!preEntities) return [];

    const entities = preEntities.map((item) =>
      removeCalculatedFieldValues(item, calculatedFieldsConfig),
    );

    const asyncFuncResults = await getAsyncFuncResults(
      infoEssence,
      resolverCreatorArg,
      resolverArg,
      entities,
    );

    const result = entities.map((item, i) =>
      prepareCalculatedFields(
        addIdsToEntity(item, entityConfig),
        infoEssence,
        asyncFuncResults,
        resolverArg,
        resolverCreatorArg,
        i,
      ),
    );

    return result;
  };

  return resolver;
};

export default createEntitiesQueryResolver;
