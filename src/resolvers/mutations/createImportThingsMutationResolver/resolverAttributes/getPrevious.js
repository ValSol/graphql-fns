// @flow
import type { GetPrevious } from '../../../flowTypes';

import executeAuthorisation from '../../../utils/executeAuthorisation';

const getPrevious: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const {
    thingConfig,
    // generalConfig,
    serversideConfig,
    inAnyCase,
  } = resolverCreatorArg;
  const { context, parentFilter } = resolverArg;
  // const { inventory } = generalConfig;
  const { name } = thingConfig;

  const inventoryChain = ['Mutation', actionGeneralName, name];
  if (!inAnyCase && !(await executeAuthorisation(inventoryChain, context, serversideConfig))) {
    return null;
  }

  const filter = inAnyCase
    ? parentFilter
    : // $FlowFixMe
      await executeAuthorisation(inventoryChain, context, serversideConfig);

  return filter && [];
};

export default getPrevious;
