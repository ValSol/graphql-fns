import type { ResolverArg, TangibleEntityConfig } from '@/tsTypes';

import createInfoEssence from '@/resolvers/utils/createInfoEssence';
import getInfoEssence from '@/resolvers/utils/getInfoEssence';
import composeConnection from './composeConnection';
import composeKeysetFilter from './composeKeysetFilter';
import composeKeysetSortKeys from './composeKeysetSortKeys';
import { fromKeysetCursor, getKeysetValues, toKeysetCursor } from './keysetCursor';

export type ConnectionPage = {
  cursor?: string; // "after" or "before"
  count: number; // "first" or "last"
  backward: boolean; // "before" & "last"
};

const reverseSortBy = (sortBy: string[]): string[] =>
  sortBy.map((sortKey) =>
    sortKey.endsWith('_ASC')
      ? `${sortKey.slice(0, -'_ASC'.length)}_DESC`
      : `${sortKey.slice(0, -'_DESC'.length)}_ASC`,
  );

// pages by the values of the sort keys of the cursor: the next page consists of the documents that
// come after the cursor document, even if it has been deleted or changed since the cursor was composed
const getKeysetConnection = async (
  { cursor, count, backward }: ConnectionPage,
  resolverArg: ResolverArg,
  entitiesQueryResolver: any,
  entityConfig: TangibleEntityConfig,
): Promise<any> => {
  const { parent, args, context, info, resolverOptions } = resolverArg;

  const {
    sort: { sortBy },
  } = args as { sort: { sortBy: string[] } };

  const keys = composeKeysetSortKeys(sortBy);

  // a malformed cursor or a cursor of another sort is ignored: the very first (last) page is returned
  const values = cursor ? fromKeysetCursor(cursor, sortBy, keys) : null;

  const side = backward ? 'before' : 'after';

  const preInfoEssence = getInfoEssence(entityConfig, info, ['edges', 'node']);

  // the values of the sort keys of the nodes compose their cursors
  const infoEssence = {
    ...preInfoEssence,
    projection: keys.reduce(
      (prev, [fieldName]) => {
        if (fieldName !== '_id') prev[fieldName] = 1;

        return prev;
      },
      { ...preInfoEssence.projection },
    ),
  };

  const getPage = () =>
    entitiesQueryResolver(
      parent,
      {
        ...args,
        sort: { sortBy: backward ? reverseSortBy(sortBy) : sortBy },
        pagination: { first: count + 1 },
        keysetFilter_from_connection: values ? composeKeysetFilter(keys, values, side) : undefined,
      },
      context,
      infoEssence,
      resolverOptions,
    );

  // whether there are documents on the other side of the cursor (the cursor document included)
  const checkOtherSide = async () => {
    if (!values) return false;

    const [entity] = await entitiesQueryResolver(
      parent,
      {
        ...args,
        sort: undefined,
        pagination: { first: 1 },
        keysetFilter_from_connection: composeKeysetFilter(
          keys,
          values,
          backward ? 'after' : 'before',
          true,
        ),
      },
      context,
      createInfoEssence({ projection: { _id: 1 } }),
      { involvedFilters: resolverOptions.involvedFilters },
    );

    return Boolean(entity);
  };

  const [entities, otherSide] = await Promise.all([getPage(), checkOtherSide()]);

  const hasMore = entities.length > count;

  const page = entities.slice(0, count);

  if (backward) page.reverse();

  return composeConnection(
    page,
    (node) => toKeysetCursor(sortBy, getKeysetValues(node, keys)),
    backward
      ? { hasNextPage: otherSide, hasPreviousPage: hasMore }
      : { hasNextPage: hasMore, hasPreviousPage: otherSide },
  );
};

export default getKeysetConnection;
