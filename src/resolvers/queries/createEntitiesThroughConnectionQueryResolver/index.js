// @flow

import type { GeneralConfig, NearInput, ServersideConfig, EntityConfig } from '../../../flowTypes';
import type { Context, ResolverCreatorArg } from '../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import executeAuthorisation from '../../utils/executeAuthorisation';
import createEntityCountQueryResolver from '../createEntityCountQueryResolver';
import createEntitiesQueryResolver from '../createEntitiesQueryResolver';
import createEntityQueryResolver from '../createEntityQueryResolver';
import getFirst from './getFirst';
import getShift from './getShift';
import getVeryFirst from './getFirst/getVeryFirst';
import getLast from './getLast';
import getVeryLast from './getLast/getVeryLast';
import fromCursor from './fromCursor';

type Args = {
  where?: Object,
  near?: NearInput,
  sort?: { sortBy: Array<string> },
  search?: string,
  after?: string,
  before?: string,
  first?: number,
  last?: number,
};

const createEntitiesThroughConnectionQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain = ['Query', 'entitiesThroughConnection', name];
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
  if (!entityQueryResolver) return null;

  const resolverCreatorArg: ResolverCreatorArg = {
    entityConfig,
    generalConfig,
    serversideConfig,
    inAnyCase,
  };

  const resolver = async (
    parent: Object,
    args: Args,
    context: Context,
    info: Object,
    parentFilter: Array<Object>,
  ): Object => {
    const filter = inAnyCase
      ? parentFilter
      : await executeAuthorisation(inventoryChain, context, serversideConfig);

    if (!filter) return null;

    const resolverArg = { parent, args, context, info, parentFilter };

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
          filter,
          entitiesQueryResolver,
        );

        if (result) return result;

        // eslint-disable-next-line no-await-in-loop
        shift2 = await getShift(_id, resolverCreatorArg, resolverArg, filter, entityQueryResolver);

        if (shift2 === null) {
          return getVeryFirst(first, resolverArg, filter, entitiesQueryResolver);
        }
      }
    }

    if (first) {
      return getVeryFirst(first, resolverArg, filter, entitiesQueryResolver);
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
        const result = await getLast(_id, shift2, last, resolverArg, filter, entitiesQueryResolver);

        if (result) return result;

        // eslint-disable-next-line no-await-in-loop
        shift2 = await getShift(_id, resolverCreatorArg, resolverArg, filter, entityQueryResolver);

        if (shift2 === null) {
          getVeryLast(last, resolverArg, filter, entitiesQueryResolver, entityCountQueryResolver);
        }
      }
    }

    if (last) {
      return getVeryLast(
        last,
        resolverArg,
        filter,
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