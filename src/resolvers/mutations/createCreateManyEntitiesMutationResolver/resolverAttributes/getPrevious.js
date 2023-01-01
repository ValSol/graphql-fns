// @flow
import type { GetPrevious } from '../../../flowTypes';

import executeAuthorisation from '../../../utils/executeAuthorisation';
import checkData from '../../checkData';

const getPrevious: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { entityConfig, generalConfig, serversideConfig, inAnyCase } = resolverCreatorArg;
  const { args, context, parentFilters } = resolverArg;
  const { name } = entityConfig;

  const inventoryChain = ['Mutation', actionGeneralName, name];
  if (!inAnyCase && !(await executeAuthorisation(inventoryChain, context, serversideConfig))) {
    return null;
  }

  const { foo: filter } = inAnyCase
    ? parentFilters
    : // $FlowFixMe
      await executeAuthorisation(inventoryChain, context, serversideConfig);

  const { data } = args;
  const processingKind = 'create';
  for (let i = 0; i < data.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const allowCreate = await checkData(
      { data: data[i] },
      filter,
      entityConfig,
      processingKind,
      generalConfig,
      serversideConfig,
      context,
    );

    if (!allowCreate) return null;
  }

  return filter && [];
};

export default getPrevious;
