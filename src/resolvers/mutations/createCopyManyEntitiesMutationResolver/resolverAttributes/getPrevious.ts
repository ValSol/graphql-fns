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

  if (!result.length) return null;

  const [item1] = result;

  if (item1._id) {
    const result2 = result.reduce<Array<any>>((prev, item, i) => {
      if (!(i % 2)) {
        prev.push(item);
      }
      return prev;
    }, []);

    return result2;
  }

  return [];
};

export default getPrevious;
