import pluralize from 'pluralize';

import type {
  Context,
  GeneralConfig,
  InventoryChain,
  NearInput,
  ServersideConfig,
  ResolverCreatorArg,
  EntityConfig,
  GraphqlScalar,
  GraphqlObject,
  InvolvedFilter,
  SintheticResolverInfo,
  TangibleEntityConfig,
  ResolverArg,
} from '@/tsTypes';

import checkInventory from '@/utils/inventory/checkInventory';
import composeQueryResolver from '@/resolvers/utils/composeQueryResolver';
import createInfoEssence from '@/resolvers/utils/createInfoEssence';
import getFilterFromInvolvedFilters from '@/resolvers/utils/getFilterFromInvolvedFilters';
import addIdTieBreaker from '../utils/addIdTieBreaker';
import getSkipConnection from '../utils/getSkipConnection';
import getKeysetConnection, { type ConnectionPage } from '../utils/keyset/getKeysetConnection';
import getParentIdsConnection from '../utils/keyset/getParentIdsConnection';
import modifyConnectionArgsAndInvolvedFilters from '../utils/modifyConnectionArgsAndInvolvedFilters';

type Args = {
  where?: any;
  near?: NearInput;
  sort?: {
    sortBy: Array<string>;
  };
  search?: string;
  after?: string;
  before?: string;
  first?: number;
  last?: number;
  // "objectIds_from_parent" pipeline used only to call from createChildEntitiesThroughConnectionQueryResolver
  objectIds_from_parent?: Array<any>;
};

const createEntitiesThroughConnectionQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): any => {
  const { inventory } = generalConfig;
  const { name: entityName } = entityConfig;

  const inventoryChain: InventoryChain = ['Query', 'entitiesThroughConnection', entityName];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const entitiesQueryResolver = composeQueryResolver(
    pluralize(entityName),
    generalConfig,
    serversideConfig,
  );

  const entityCountQueryResolver = composeQueryResolver(
    `${entityName}_Count`,
    generalConfig,
    serversideConfig,
  );

  const resolverCreatorArg: ResolverCreatorArg = {
    entityConfig,
    generalConfig,
    serversideConfig,
    inAnyCase,
  };

  const resolver = async (
    parent: null | GraphqlObject,
    preArgs: Args,
    context: Context,
    info: SintheticResolverInfo,
    resolverOptions: {
      involvedFilters: {
        [representationConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
      };
      materializeCalculatedFields?: boolean;
      calculatedFieldsConfig?: EntityConfig;
    },
  ): Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> => {
    const { involvedFilters: preInvolvedFilters } = resolverOptions;

    const [preArgs2, involvedFilters] = modifyConnectionArgsAndInvolvedFilters(
      preArgs,
      preInvolvedFilters,
      entityName,
    );

    const { filter } = getFilterFromInvolvedFilters(involvedFilters);

    if (!filter) {
      return {
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        edges: [],
      };
    }

    let args = preArgs2;

    if (Boolean(preArgs2.near) && Boolean(preArgs2.search)) {
      const { search, where, ...restArgs } = preArgs2;
      const {
        inputOutputFilterAndLimit: [filters],
      } = involvedFilters;

      const { coordinates: center, geospatialField, maxDistance: radius } = preArgs2.near;

      const where2 =
        radius === undefined
          ? where
          : { AND: [where, { [`${geospatialField}_withinSphere`]: { center, radius } }] };

      const ids = await entitiesQueryResolver(
        parent,
        { search, where: where2 },
        context,
        createInfoEssence({ projection: { _id: 1 } }),
        { involvedFilters: { inputOutputFilterAndLimit: [filters] } },
      );

      args = { ...restArgs, where: { id_in: ids.map(({ id }) => id) } };
    }

    args = addIdTieBreaker(args);

    const resolverArg = {
      parent,
      args,
      context,
      info,
      // "materializeCalculatedFields" & "calculatedFieldsConfig" are passed on to the list resolver
      resolverOptions: { ...resolverOptions, involvedFilters },
    } as ResolverArg;

    const { after, before, first, last, sort, objectIds_from_parent: objectIdsFromParent } = args;

    let page: ConnectionPage;

    if (after) {
      if (typeof first === 'undefined') {
        throw new TypeError(
          `For "after" arg ("${after}", entity: "${entityName}") not found "first" arg!`,
        );
      }

      page = { cursor: after, count: first, backward: false };
    } else if (first) {
      page = { count: first, backward: false };
    } else if (before) {
      if (typeof last === 'undefined') {
        throw new TypeError(
          `For "before" arg ("${before}", entity: "${entityName}") not found "last" arg!`,
        );
      }

      page = { cursor: before, count: last, backward: true };
    } else if (last) {
      page = { count: last, backward: true };
    } else {
      throw new TypeError(
        `Incorrect set of args in "entitiesThroughConnection" query, entity: "${entityName}"!`,
      );
    }

    if (objectIdsFromParent) {
      return getParentIdsConnection(
        page,
        resolverArg,
        entitiesQueryResolver,
        entityConfig as TangibleEntityConfig,
      );
    }

    // the order is defined by the values of the sort keys ("id" is the last of them), "near" without "sort"
    // is sorted by the distance & "id"
    if (sort?.sortBy.length) {
      return getKeysetConnection(
        page,
        resolverArg,
        entitiesQueryResolver,
        entityConfig as TangibleEntityConfig,
      );
    }

    return getSkipConnection(
      page,
      resolverCreatorArg,
      resolverArg,
      involvedFilters,
      entitiesQueryResolver,
      entityCountQueryResolver,
    );
  };
  return resolver;
};

export default createEntitiesThroughConnectionQueryResolver;
