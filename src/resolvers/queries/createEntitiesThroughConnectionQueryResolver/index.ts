import type {
  Context,
  GeneralConfig,
  InventoryСhain,
  NearInput,
  ServersideConfig,
  EntityConfig,
  GraphqlScalar,
  GraphqlObject,
  InvolvedFilter,
  SintheticResolverInfo,
} from '../../../tsTypes';
import type { ResolverCreatorArg } from '../../tsTypes';

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

  const inventoryChain: InventoryСhain = ['Query', 'entitiesThroughConnection', name];
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
    const [args, involvedFilters] = modifyConnectionArgsAndInvolvedFilters(
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
        // eslint-disable-next-line no-await-in-loop
        const result = await getFirst(
          _id,
          shift2,
          first,
          resolverArg,
          involvedFilters,
          entitiesQueryResolver,
        );

        if (result) return result;

        // eslint-disable-next-line no-await-in-loop
        shift2 = await getShift(
          _id,
          resolverCreatorArg,
          resolverArg,
          involvedFilters,
          entityQueryResolver,
        );

        if (shift2 === null) {
          return getVeryFirst(first, resolverArg, involvedFilters, entitiesQueryResolver);
        }
      }
    }

    if (first) {
      return getVeryFirst(first, resolverArg, involvedFilters, entitiesQueryResolver);
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
        // eslint-disable-next-line no-await-in-loop
        const result = await getLast(
          _id,
          shift2,
          last,
          resolverArg,
          involvedFilters,
          entitiesQueryResolver,
        );

        if (result) return result;

        // eslint-disable-next-line no-await-in-loop
        shift2 = await getShift(
          _id,
          resolverCreatorArg,
          resolverArg,
          involvedFilters,
          entityQueryResolver,
        );

        if (shift2 === null) {
          getVeryLast(
            last,
            resolverArg,
            involvedFilters,
            entitiesQueryResolver,
            entityCountQueryResolver,
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
      );
    }

    throw new TypeError(
      `Incorrect set of args in "entitiesThroughConnection" query, entity: "${name}"!`,
    );
  };
  return resolver;
};

export default createEntitiesThroughConnectionQueryResolver;
