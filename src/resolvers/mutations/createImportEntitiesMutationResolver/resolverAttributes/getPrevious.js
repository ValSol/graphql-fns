// @flow
import type { GetPrevious } from '../../../flowTypes';

import executeAuthorisation from '../../../utils/executeAuthorisation';

const getPrevious: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const {
    entityConfig,
    // generalConfig,
    serversideConfig,
    inAnyCase,
  } = resolverCreatorArg;
  const { context, parentFilters } = resolverArg;
  // const { inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain = ['Mutation', actionGeneralName, name];
  if (!inAnyCase && !(await executeAuthorisation(inventoryChain, context, serversideConfig))) {
    return null;
  }

  const { foo: filter } = inAnyCase
    ? parentFilters
    : // $FlowFixMe
      await executeAuthorisation(inventoryChain, context, serversideConfig);

  return filter && [];
};

export default getPrevious;
