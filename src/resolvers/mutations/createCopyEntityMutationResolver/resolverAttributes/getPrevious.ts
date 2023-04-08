import type {GetPrevious} from '../../../tsTypes';

import getCommonData from './getCommonData';

const getPrevious: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { involvedFilters } = resolverArg;

  const result = await getCommonData(resolverCreatorArg, resolverArg, involvedFilters);

  if (!result) return result;

  const [item1, item2] = result;

  return item2 ? [item1] : [];
};

export default getPrevious;
