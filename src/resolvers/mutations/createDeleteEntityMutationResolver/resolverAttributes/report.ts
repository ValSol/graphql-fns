import type { Report } from '@/resolvers/tsTypes';

import composeReport from '@/utils/composeReport';

const report: Report = async (resolverCreatorArg, resolverArg) => {
  const { entityConfig } = resolverCreatorArg;
  const {
    context,
    resolverOptions: { subscriptionEntityNames },
  } = resolverArg;
  const { name } = entityConfig;

  const { subscriptionDeletedEntityName } = subscriptionEntityNames || {};

  if (!subscriptionDeletedEntityName) {
    return null;
  }

  return ({ previous: [node] }) => composeReport('deleted', name, context, node);
};

export default report;
