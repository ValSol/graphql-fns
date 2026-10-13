import type { Report } from '@/resolvers/tsTypes';

import createEntityReport from '../../createCreateEntityMutationResolver/resolverAttributes/report';

// publish "created" event only if entity is created (not found)
const report: Report = async (resolverCreatorArg, resolverArg) => {
  const subscription = await createEntityReport(resolverCreatorArg, resolverArg);

  if (!subscription) return null;

  return (result) => {
    if (result.previous.length === 0) {
      subscription(result);
    }
  };
};

export default report;
