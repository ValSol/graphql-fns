// @flow

import type { GetPrevious } from '../../../flowTypes';

import executeAuthorisation from '../../../utils/executeAuthorisation';
import getCommonData from './getCommonData';

const getPrevious: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { thingConfig, serversideConfig, inAnyCase } = resolverCreatorArg;
  const { context, parentFilter } = resolverArg;
  const { name } = thingConfig;

  const inventoryChain = ['Mutation', actionGeneralName, name];

  const filter = inAnyCase
    ? parentFilter
    : // $FlowFixMe
      await executeAuthorisation(inventoryChain, context, serversideConfig);

  if (!filter) return null;

  const result = await getCommonData(resolverCreatorArg, resolverArg, filter);

  if (!result) return result;

  const [item1, item2] = result;

  return item2 ? [item1] : [];
};

export default getPrevious;
