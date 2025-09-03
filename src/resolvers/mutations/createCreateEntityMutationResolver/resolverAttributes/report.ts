import type { Report } from '@/resolvers/tsTypes';

import composeReport from '@/utils/composeReport';

const report: Report = async (resolverCreatorArg, resolverArg) => {
  const { entityConfig } = resolverCreatorArg;
  const {
    context,
    resolverOptions: { subscriptionEntityNames },
  } = resolverArg;
  const { name } = entityConfig;

  const { subscriptionCreatedEntityName } = subscriptionEntityNames || {};

  if (!subscriptionCreatedEntityName) {
    return null;
  }

  return ({ current: [node] }) => composeReport('created', name, context, node);
};

export default report;
