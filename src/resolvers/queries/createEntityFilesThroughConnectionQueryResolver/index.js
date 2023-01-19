// @flow

import type { GeneralConfig, ServersideConfig, EntityConfig } from '../../../flowTypes';
import type { Context, ResolverCreatorArg } from '../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import getFilterFromInvolvedFilters from '../../utils/getFilterFromInvolvedFilters';
import createEntityFileCountQueryResolver from '../createEntityFileCountQueryResolver';
import createEntityFilesQueryResolver from '../createEntityFilesQueryResolver';
import createEntityFileQueryResolver from '../createEntityFileQueryResolver';
import getFirst from '../utils/getFirst';
import getShift from '../utils/getShift';
import getVeryFirst from '../utils/getFirst/getVeryFirst';
import getLast from '../utils/getLast';
import getVeryLast from '../utils/getLast/getVeryLast';
import fromCursor from '../../utils/fromCursor';

type Args = {
  where?: Object,
  after?: string,
  before?: string,
  first?: number,
  last?: number,
};

const createEntityFilesThroughConnectionQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain = ['Query', 'entityFilesThroughConnection', name];
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
    parent: Object,
    args: Args,
    context: Context,
    info: Object,
    involvedFilters: { [derivativeConfigName: string]: null | Array<Object> },
  ): Object => {
    const filter = getFilterFromInvolvedFilters(involvedFilters);

    if (!filter) return null;

    const resolverArg = { parent, args, context, info, involvedFilters };

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
          return getVeryFirst(first, resolverArg, involvedFilters, entityFilesQueryResolver);
        }
      }
    }

    if (first) {
      return getVeryFirst(first, resolverArg, involvedFilters, entityFilesQueryResolver);
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
      );
    }

    throw new TypeError(
      `Incorrect set of args in "entityFilesThroughConnection" query, entity: "${name}"!`,
    );
  };
  return resolver;
};

export default createEntityFilesThroughConnectionQueryResolver;
