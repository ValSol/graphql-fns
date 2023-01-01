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

  const [item1, item2] = result;

  return item2 ? [item1] : [];
};

export default getPrevious;
