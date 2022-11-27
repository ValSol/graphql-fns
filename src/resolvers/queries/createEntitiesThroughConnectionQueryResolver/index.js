// @flow

import type { GeneralConfig, NearInput, ServersideConfig, EntityConfig } from '../../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import executeAuthorisation from '../../utils/executeAuthorisation';
import createEntitiesQueryResolver from '../createEntitiesQueryResolver';
import composeFirstEdges from './composeFirstEdges';
import composeLastEdges from './composeLastEdges';
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
type Context = { mongooseConn: Object };

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

    const { after, before, first, last } = args;

    if (after) {
      if (typeof first === 'undefined') {
        throw new TypeError(
          `For "after" arg ("${after}", entity: "${name}") not found "first" arg!`,
        );
      }

      const { _id, shift } = fromCursor(after) || {}; // adding "|| {}" to prevent flowjs error

      const pagination = { skip: shift, first: first + 2 };

      const entities = await entitiesQueryResolver(
        parent,
        { ...args, pagination },
        context,
        info,
        parentFilter,
      );

      // eslint-disable-next-line no-underscore-dangle
      if (entities?.[0]?.id?.toString() !== _id) {
        // TODO processing dynamic list
        throw new TypeError(
          `Got dynamic list in "entitiesThroughConnection" query, entity: "${name}"!`,
        );
      }

      return composeFirstEdges(shift, first, entities);
    }

    if (first) {
      const pagination = { skip: 0, first: first + 1 };

      const entities = await entitiesQueryResolver(
        parent,
        { ...args, pagination },
        context,
        info,
        parentFilter,
      );

      const shift = -1;

      return composeFirstEdges(shift, first, entities);
    }

    if (before) {
      if (typeof last === 'undefined') {
        throw new TypeError(
          `For "before" arg ("${before}", entity: "${name}") not found "last" arg!`,
        );
      }

      const { _id, shift } = fromCursor(before) || {}; // adding "|| {}" to prevent flowjs error

      const firstForBefore = last + 2 > shift ? shift + 1 : last + 2;
      const skip = last + 2 > shift ? 0 : shift - last - 1;

      const pagination = { skip, first: firstForBefore };

      const entities = await entitiesQueryResolver(
        parent,
        { ...args, pagination },
        context,
        info,
        parentFilter,
      );

      const { length } = entities;

      // eslint-disable-next-line no-underscore-dangle
      if (entities?.[length - 1]?.id?.toString() !== _id) {
        // TODO processing dynamic list
        throw new TypeError(
          `Got dynamic list in "entitiesThroughConnection" query, entity: "${name}"!`,
        );
      }

      return composeLastEdges(shift, last, entities);
    }

    throw new TypeError(
      `Incorrect set of args in "entitiesThroughConnection" query, entity: "${name}"!`,
    );
  };
  return resolver;
};

export default createEntitiesThroughConnectionQueryResolver;
