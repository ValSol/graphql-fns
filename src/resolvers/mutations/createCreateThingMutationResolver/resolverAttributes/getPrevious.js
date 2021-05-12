// @flow

import type { GetPrevious } from '../../../flowTypes';

import executeAuthorisation from '../../../utils/executeAuthorisation';
import checkData from '../../checkData';

const get: GetPrevious = async (
  actionGeneralName,
  resolverCreatorArg,
  resolverArg,
  customFilter,
) => {
  const { thingConfig, generalConfig, serversideConfig, inAnyCase } = resolverCreatorArg;
  const { args, context, parentFilter } = resolverArg;
  const { name } = thingConfig;

  const inventoryChain = ['Mutation', actionGeneralName, name];

  const filter =
    customFilter ||
    (inAnyCase
      ? parentFilter
      : // $FlowFixMe
        await executeAuthorisation(inventoryChain, context, serversideConfig));

  if (!filter) return null;

  const { data } = args;

  const toCreate = true;
  const allowCreate = await checkData(
    data,
    filter,
    thingConfig,
    toCreate,
    generalConfig,
    serversideConfig,
    context,
  );

  return allowCreate && [];
};

export default get;
