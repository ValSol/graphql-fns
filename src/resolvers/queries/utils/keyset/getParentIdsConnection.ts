import type { ResolverArg, TangibleEntityConfig } from '@/tsTypes';

import createInfoEssence from '@/resolvers/utils/createInfoEssence';
import fromCursor from '@/resolvers/utils/fromCursor';
import getInfoEssence from '@/resolvers/utils/getInfoEssence';
import toCursor from '@/resolvers/utils/toCursor';
import composeConnection from './composeConnection';
import type { ConnectionPage } from './getKeysetConnection';

// pages the entities in the order of the ids of the parent's field ("objectIds_from_parent"): the key
// is the position in the array of the ids, so a page is selected by the ids that follow (precede)
// the cursor entity; the cursor keeps the position of the entity in case it's removed from the array
const getParentIdsConnection = async (
  { cursor, count, backward }: ConnectionPage,
  resolverArg: ResolverArg,
  entitiesQueryResolver: any,
  entityConfig: TangibleEntityConfig,
): Promise<any> => {
  const { parent, args, context, info, resolverOptions } = resolverArg;

  const { objectIds_from_parent: objectIds } = args as { objectIds_from_parent: any[] };

  const positions = objectIds.reduce<Map<string, number>>((prev, id, i) => {
    const key = id.toString();

    if (!prev.has(key)) prev.set(key, i);

    return prev;
  }, new Map());

  const decoded = cursor ? fromCursor(cursor) : null;

  // a malformed cursor is ignored: the very first (last) page is returned
  const position = decoded
    ? Math.min(Math.max(positions.get(decoded._id) ?? decoded.shift, -1), objectIds.length)
    : null;

  const [candidates, otherSide] =
    position === null
      ? [objectIds, []]
      : backward
        ? [objectIds.slice(0, Math.max(position, 0)), objectIds.slice(Math.max(position, 0))]
        : [objectIds.slice(position + 1), objectIds.slice(0, position + 1)];

  const getPage = () =>
    entitiesQueryResolver(
      parent,
      {
        ...args,
        objectIds_from_parent: backward ? [...candidates].reverse() : candidates,
        pagination: { first: count + 1 },
        keysetFilter_from_connection: position === null ? undefined : { _id: { $in: candidates } },
      },
      context,
      getInfoEssence(entityConfig, info, ['edges', 'node']),
      resolverOptions,
    );

  // whether there are entities on the other side of the cursor (the cursor entity included)
  const checkOtherSide = async () => {
    if (otherSide.length === 0) return false;

    const [entity] = await entitiesQueryResolver(
      parent,
      {
        ...args,
        objectIds_from_parent: undefined,
        pagination: { first: 1 },
        keysetFilter_from_connection: { _id: { $in: otherSide } },
      },
      context,
      createInfoEssence({ projection: { _id: 1 } }),
      { involvedFilters: resolverOptions.involvedFilters },
    );

    return Boolean(entity);
  };

  const [entities, hasOtherSide] = await Promise.all([getPage(), checkOtherSide()]);

  const hasMore = entities.length > count;

  const page = entities.slice(0, count);

  if (backward) page.reverse();

  return composeConnection(
    page,
    (node) => toCursor(node.id.toString(), positions.get(node.id.toString()) as number),
    backward
      ? { hasNextPage: hasOtherSide, hasPreviousPage: hasMore }
      : { hasNextPage: hasMore, hasPreviousPage: hasOtherSide },
  );
};

export default getParentIdsConnection;
