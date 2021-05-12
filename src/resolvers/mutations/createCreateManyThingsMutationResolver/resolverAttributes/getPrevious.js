// @flow
import type { GetPrevious } from '../../../flowTypes';

import executeAuthorisation from '../../../utils/executeAuthorisation';

const getPrevious: GetPrevious = async (
  actionGeneralName,
  resolverCreatorArg,
  resolverArg,
  customFilter,
) => {
  const { thingConfig, serversideConfig, inAnyCase } = resolverCreatorArg;
  const { context, parentFilter } = resolverArg;
  const { name } = thingConfig;

  const inventoryChain = ['Mutation', actionGeneralName, name];
  if (!inAnyCase && !(await executeAuthorisation(inventoryChain, context, serversideConfig))) {
    return null;
  }

  const filter =
    customFilter ||
    (inAnyCase
      ? parentFilter
      : // $FlowFixMe
        await executeAuthorisation(inventoryChain, context, serversideConfig));

  return filter && [];
};

export default getPrevious;
