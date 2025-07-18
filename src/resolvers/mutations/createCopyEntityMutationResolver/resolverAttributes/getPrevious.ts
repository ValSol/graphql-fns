import type { GetPrevious } from '../../../tsTypes';

import getCommonData from './getCommonData';

const getPrevious: GetPrevious = async (
  actionGeneralName,
  resolverCreatorArg,
  resolverArg,
  session,
) => {
  const { involvedFilters } = resolverArg;

  const result = await getCommonData(resolverCreatorArg, resolverArg, session, involvedFilters);

  if (!result) return result;

  const [item1, item2] = result;

  return item2 ? [item1] : [];
};

export default getPrevious;
