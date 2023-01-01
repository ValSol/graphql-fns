// @flow

import type { GetPrevious } from '../../../flowTypes';

import executeAuthorisation from '../../../utils/executeAuthorisation';
import getCommonData from './getCommonData';

const getPrevious: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { entityConfig, serversideConfig, inAnyCase } = resolverCreatorArg;
  const { context, parentFilters } = resolverArg;
  const { name } = entityConfig;

  const inventoryChain = ['Mutation', actionGeneralName, name];

  const { foo: filter } = inAnyCase
    ? parentFilters
    : // $FlowFixMe
      await executeAuthorisation(inventoryChain, context, serversideConfig);

  if (!filter) return null;

  const result = await getCommonData(resolverCreatorArg, resolverArg, filter);

  if (!result) return result;

  if (!result.length) return null;

  const [item1] = result;

  // eslint-disable-next-line no-underscore-dangle
  if (item1._id) {
    const result2 = result.reduce((prev, item, i) => {
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
