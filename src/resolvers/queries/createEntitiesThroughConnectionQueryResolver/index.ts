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
} from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import fromCursor from '../../utils/fromCursor';
import getFilterFromInvolvedFilters from '../../utils/getFilterFromInvolvedFilters';
import createEntityCountQueryResolver from '../createEntityCountQueryResolver';
import createEntitiesQueryResolver from '../createEntitiesQueryResolver';
import createEntityQueryResolver from '../createEntityQueryResolver';
import getFirst from '../utils/getFirst';
import getShift from '../utils/getShift';
import getVeryFirst from '../utils/getFirst/getVeryFirst';
import getLast from '../utils/getLast';
import getVeryLast from '../utils/getLast/getVeryLast';
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
  const { name } = entityConfig;

  const inventoryChain: InventoryChain = ['Query', 'entitiesThroughConnection', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const entitiesQueryResolver = createEntitiesQueryResolver(
    entityConfig,
    generalConfig,
    serversideConfig,
    true, // inAnyCase,
  );
  if (!entitiesQueryResolver) return null;

  const entityQueryResolver = createEntityQueryResolver(
    entityConfig,
    generalConfig,
    serversideConfig,
    true, // inAnyCase,
  );
  if (!entityQueryResolver) return null;

  const entityCountQueryResolver = createEntityCountQueryResolver(
    entityConfig,
    generalConfig,
    serversideConfig,
    true, // inAnyCase,
  );
  if (!entityCountQueryResolver) return null;

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
    preInvolvedFilters: {
      [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
    },
  ): Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> => {
    const [preArgs2, involvedFilters] = modifyConnectionArgsAndInvolvedFilters(
      preArgs,
      preInvolvedFilters,
      name,
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
        inputOutputEntity: [filters],
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
        { projection: { _id: 1 } },
        { inputOutputEntity: [filters] },
      );

      args = { ...restArgs, where: { id_in: ids.map(({ id }) => id) } };
    }

    const resolverArg = { parent, args, context, info, involvedFilters } as const;

    const { after, before, first, last } = args;

    if (after) {
      if (typeof first === 'undefined') {
        throw new TypeError(
          `For "after" arg ("${after}", entity: "${name}") not found "first" arg!`,
        );
      }

      const { _id, shift } = fromCursor(after) || {}; // adding "|| {}" to prevent flowjs error

      let shift2 = shift;

      for (let i = 0; i < 10; i += 1) {
        const result = await getFirst(
          _id,
          shift2,
          first,
          resolverArg,
          involvedFilters,
          entitiesQueryResolver,
          entityConfig as TangibleEntityConfig,
        );

        if (result) return result;

        shift2 = await getShift(
          _id,
          resolverCreatorArg,
          resolverArg,
          involvedFilters,
          entityQueryResolver,
        );

        if (shift2 === null) {
          return getVeryFirst(
            first,
            resolverArg,
            involvedFilters,
            entitiesQueryResolver,
            entityConfig as TangibleEntityConfig,
          );
        }
      }
    }

    if (first) {
      return getVeryFirst(
        first,
        resolverArg,
        involvedFilters,
        entitiesQueryResolver,
        entityConfig as TangibleEntityConfig,
      );
    }

    if (before) {
      if (typeof last === 'undefined') {
        throw new TypeError(
          `For "before" arg ("${before}", entity: "${name}") not found "last" arg!`,
        );
      }

      const { _id, shift } = fromCursor(before) || {}; // adding "|| {}" to prevent flowjs error

      let shift2 = shift;

      for (let i = 0; i < 10; i += 1) {
        const result = await getLast(
          _id,
          shift2,
          last,
          resolverArg,
          involvedFilters,
          entitiesQueryResolver,
          entityConfig as TangibleEntityConfig,
        );

        if (result) return result;

        shift2 = await getShift(
          _id,
          resolverCreatorArg,
          resolverArg,
          involvedFilters,
          entityQueryResolver,
        );

        if (shift2 === null) {
          await getVeryLast(
            last,
            resolverArg,
            involvedFilters,
            entitiesQueryResolver,
            entityCountQueryResolver,
            entityConfig as TangibleEntityConfig,
          );
        }
      }
    }

    if (last) {
      return getVeryLast(
        last,
        resolverArg,
        involvedFilters,
        entitiesQueryResolver,
        entityCountQueryResolver,
        entityConfig as TangibleEntityConfig,
      );
    }

    throw new TypeError(
      `Incorrect set of args in "entitiesThroughConnection" query, entity: "${name}"!`,
    );
  };
  return resolver;
};

export default createEntitiesThroughConnectionQueryResolver;
