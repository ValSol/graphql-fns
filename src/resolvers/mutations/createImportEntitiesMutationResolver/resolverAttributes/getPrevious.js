// @flow
import type { GetPrevious } from '../../../flowTypes';

const getPrevious: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { involvedFilters } = resolverArg;
  // const { inventory } = generalConfig;

  const { inputEntity: filter } = involvedFilters;

  return filter && [];
};

export default getPrevious;
