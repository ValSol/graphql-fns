import type { GetPrevious } from '../../../tsTypes';

import getFilterFromInvolvedFilters from '../../../utils/getFilterFromInvolvedFilters';

const getPrevious: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { involvedFilters } = resolverArg;
  // const { inventory } = generalConfig;

  const { filter } = getFilterFromInvolvedFilters(involvedFilters);

  return filter && [];
};

export default getPrevious;
