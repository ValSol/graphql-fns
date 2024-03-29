import type {
  Context,
  GeneralConfig,
  InventoryСhain,
  ServersideConfig,
  EntityConfig,
  InvolvedFilter,
  ResolverCreatorArg,
  SintheticResolverInfo,
  GraphqlScalar,
  GraphqlObject,
  TangibleEntityConfig,
} from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import fromCursor from '../../utils/fromCursor';
import getFilterFromInvolvedFilters from '../../utils/getFilterFromInvolvedFilters';
import createEntityFileCountQueryResolver from '../createEntityFileCountQueryResolver';
import createEntityFilesQueryResolver from '../createEntityFilesQueryResolver';
import createEntityFileQueryResolver from '../createEntityFileQueryResolver';
import getFirst from '../utils/getFirst';
import getShift from '../utils/getShift';
import getVeryFirst from '../utils/getFirst/getVeryFirst';
import getLast from '../utils/getLast';
import getVeryLast from '../utils/getLast/getVeryLast';
import modifyConnectionArgsAndInvolvedFilters from '../utils/modifyConnectionArgsAndInvolvedFilters';

type Args = {
  where?: any;
  after?: string;
  before?: string;
  first?: number;
  last?: number;
};

const createEntityFilesThroughConnectionQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): any => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain: InventoryСhain = ['Query', 'entityFilesThroughConnection', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const entityFilesQueryResolver = createEntityFilesQueryResolver(
    entityConfig,
    generalConfig,
    serversideConfig,
    true, // inAnyCase,
  );
  if (!entityFilesQueryResolver) return null;

  const entityFileQueryResolver = createEntityFileQueryResolver(
    entityConfig,
    generalConfig,
    serversideConfig,
    true, // inAnyCase,
  );
  if (!entityFileQueryResolver) return null;

  const entityFileCountQueryResolver = createEntityFileCountQueryResolver(
    entityConfig,
    generalConfig,
    serversideConfig,
    true, // inAnyCase,
  );
  if (!entityFileCountQueryResolver) return null;

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
          entityFilesQueryResolver,
          entityConfig as TangibleEntityConfig,
        );

        if (result) return result;

        // eslint-disable-next-line no-await-in-loop
        shift2 = await getShift(
          _id,
          resolverCreatorArg,
          resolverArg,
          involvedFilters,
          entityFileQueryResolver,
        );

        if (shift2 === null) {
          return getVeryFirst(
            first,
            resolverArg,
            involvedFilters,
            entityFilesQueryResolver,
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
        entityFilesQueryResolver,
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
        // eslint-disable-next-line no-await-in-loop
        const result = await getLast(
          _id,
          shift2,
          last,
          resolverArg,
          involvedFilters,
          entityFilesQueryResolver,
          entityConfig as TangibleEntityConfig,
        );

        if (result) return result;

        // eslint-disable-next-line no-await-in-loop
        shift2 = await getShift(
          _id,
          resolverCreatorArg,
          resolverArg,
          involvedFilters,
          entityFileQueryResolver,
        );

        if (shift2 === null) {
          getVeryLast(
            last,
            resolverArg,
            involvedFilters,
            entityFilesQueryResolver,
            entityFileCountQueryResolver,
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
        entityFilesQueryResolver,
        entityFileCountQueryResolver,
        entityConfig as TangibleEntityConfig,
      );
    }

    throw new TypeError(
      `Incorrect set of args in "entityFilesThroughConnection" query, entity: "${name}"!`,
    );
  };
  return resolver;
};

export default createEntityFilesThroughConnectionQueryResolver;
