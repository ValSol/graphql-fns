// @flow
import type { GetPrevious } from '../../../flowTypes';

const getPrevious: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { parentFilters } = resolverArg;
  // const { inventory } = generalConfig;

  const { mainEntity: filter } = parentFilters;

  return filter && [];
};

export default getPrevious;
