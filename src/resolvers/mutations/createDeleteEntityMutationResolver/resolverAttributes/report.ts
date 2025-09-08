import type { Report } from '@/resolvers/tsTypes';

import composeReport from '@/utils/composeReport';

const report: Report = async (resolverCreatorArg, resolverArg) => {
  const { entityConfig } = resolverCreatorArg;
  const {
    context,
    resolverOptions: { subscriptionEntityNames },
  } = resolverArg;

  const { subscriptionDeletedEntityName } = subscriptionEntityNames || {};

  if (!subscriptionDeletedEntityName) {
    return null;
  }

  return ({ previous: [node] }) => composeReport('deleted', entityConfig, context, node);
};

export default report;
