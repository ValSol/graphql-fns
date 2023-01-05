// @flow

import type { GetPrevious } from '../../../flowTypes';

import getCommonData from './getCommonData';

const getPrevious: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { parentFilters } = resolverArg;

  const { mainEntity: filter } = parentFilters;

  if (!filter) return null;

  const result = await getCommonData(resolverCreatorArg, resolverArg, filter);

  if (!result) return result;

  const [item1, item2] = result;

  return item2 ? [item1] : [];
};

export default getPrevious;
