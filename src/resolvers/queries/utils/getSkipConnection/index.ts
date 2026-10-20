import mongoose from 'mongoose';

import type {
  InvolvedFilter,
  ResolverArg,
  ResolverCreatorArg,
  TangibleEntityConfig,
} from '@/tsTypes';

import composeQueryResolver from '@/resolvers/utils/composeQueryResolver';
import fromCursor from '@/resolvers/utils/fromCursor';
import getFirst from '../getFirst';
import getVeryFirst from '../getFirst/getVeryFirst';
import getLast from '../getLast';
import getVeryLast from '../getLast/getVeryLast';
import getShift from '../getShift';
import type { ConnectionPage } from '../keyset/getKeysetConnection';

// pages by "skip" the orders that are not defined by the values of fields: by the distance ("near")
// and by the text score ("search" without "sort"); the cursor keeps the id & the position of its entity,
// the position is computed again ("getShift") if the entity isn't found at it
const getSkipConnection = async (
  { cursor, count, backward }: ConnectionPage,
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
  involvedFilters: {
    [representationConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
  },
  entitiesQueryResolver: any,
  entityCountQueryResolver: any,
): Promise<any> => {
  const { entityConfig: preEntityConfig, generalConfig, serversideConfig } = resolverCreatorArg;

  const entityConfig = preEntityConfig as TangibleEntityConfig;

  const getVeryEdge = () =>
    backward
      ? getVeryLast(
          count,
          resolverArg,
          involvedFilters,
          entitiesQueryResolver,
          entityCountQueryResolver,
          entityConfig,
        )
      : getVeryFirst(count, resolverArg, involvedFilters, entitiesQueryResolver, entityConfig);

  const decoded = cursor ? fromCursor(cursor) : null;

  // a malformed cursor is ignored: the very first (last) page is returned
  if (!decoded || !mongoose.isObjectIdOrHexString(decoded._id)) return getVeryEdge();

  const { _id } = decoded;

  let { shift } = decoded;

  for (let i = 0; i < 10; i += 1) {
    const result = await (backward ? getLast : getFirst)(
      _id,
      shift,
      count,
      resolverArg,
      involvedFilters,
      entitiesQueryResolver,
      entityConfig,
    );

    if (result) return result;

    const shift2 = await getShift(
      _id,
      resolverCreatorArg,
      resolverArg,
      involvedFilters,
      composeQueryResolver(entityConfig.name, generalConfig, serversideConfig),
    );

    // the cursor entity is deleted or no longer matches the filter
    if (shift2 === null) return getVeryEdge();

    shift = shift2;
  }

  return getVeryEdge();
};

export default getSkipConnection;
