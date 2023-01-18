// @flow
import type { GetPrevious } from '../../../flowTypes';

const getPrevious: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { involvedFilters } = resolverArg;
  // const { inventory } = generalConfig;

  const { inputOutputEntity: filter } = involvedFilters;

  return filter && [];
};

export default getPrevious;
