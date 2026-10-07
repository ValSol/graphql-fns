import type { ActionResolver, GeneralConfig, TangibleEntityConfig } from '@/tsTypes';

import composeSubscriptionReportArgs from '../composeSubscriptionReportArgs';
import type { SubscriptionReportKind } from '../composeSubscriptionReportArgs';

// a raw "create…" / "update…" / "delete…" mutation resolver that publishes its event as the generated
// mutation does; called with the "info" of the client as any resolver
const withSubscriptionReport =
  (
    resolver: ActionResolver,
    kind: SubscriptionReportKind,
    entityConfig: TangibleEntityConfig,
    generalConfig: GeneralConfig,
  ): ActionResolver =>
  (parent, args, context, info, resolverOptions) => {
    const reportArgs = composeSubscriptionReportArgs(
      kind,
      entityConfig,
      generalConfig,
      info,
      resolverOptions,
    );

    return resolver(parent, args, context, reportArgs.info, reportArgs.resolverOptions);
  };

export default withSubscriptionReport;
