import type { Report } from '@/resolvers/tsTypes';

import composeReport from '@/utils/composeReport';

const report: Report = async (resolverCreatorArg, resolverArg) => {
  const { entityConfig } = resolverCreatorArg;
  const {
    context,
    resolverOptions: { subscriptionEntityNames },
  } = resolverArg;

  const { subscriptionUpdatedEntityName } = subscriptionEntityNames || {};

  if (!subscriptionUpdatedEntityName) {
    return null;
  }

  return ({ previous: [previousNode], current: [node] }) =>
    composeReport('updated', entityConfig, context, node, previousNode);
};

export default report;
