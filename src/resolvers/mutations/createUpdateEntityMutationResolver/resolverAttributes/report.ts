import type { Report } from '@/resolvers/tsTypes';

import composeReport from '@/utils/composeReport';

const report: Report = async (resolverCreatorArg, resolverArg) => {
  const { entityConfig } = resolverCreatorArg;
  const {
    context,
    resolverOptions: { subscriptionEntityNames },
  } = resolverArg;
  const { name } = entityConfig;

  const { subscriptionUpdatedEntityName } = subscriptionEntityNames || {};

  if (!subscriptionUpdatedEntityName) {
    return null;
  }

  return ({ previous: [previousNode], current: [node] }) =>
    composeReport('updated', name, context, node, previousNode);
};

export default report;
