import type {
  GeneralConfig,
  InfoEssence,
  SintheticResolverInfo,
  SubscriptionInvolvedEntityNames,
  TangibleEntityConfig,
} from '@/tsTypes';

import checkInventory from '@/utils/inventory/checkInventory';
import { WITHOUT_CALCULATED_WITH_ASYNC } from '@/utils/composeFieldsObject';
import composeAllFieldsProjection from '../composeAllFieldsProjection';
import createInfoEssence from '../createInfoEssence';
import getInfoEssence from '../getInfoEssence';

export type SubscriptionReportKind = 'created' | 'updated' | 'deleted';

const subscriptionEntityNameKeys = {
  created: 'subscriptionCreatedEntityName',
  updated: 'subscriptionUpdatedEntityName',
  deleted: 'subscriptionDeletedEntityName',
} as const;

// the 4th & 5th arguments that make a raw "create…" / "update…" / "delete…" mutation resolver (called
// directly or in "workOutMutations") publish its event as the generated mutation does (see "authDecorator")
// the types of the arguments are kept, so the result fits a direct call as well as "workOutMutations"
const composeSubscriptionReportArgs = <
  TInfo extends SintheticResolverInfo | null | undefined,
  TResolverOptions extends object,
>(
  kind: SubscriptionReportKind,
  entityConfig: TangibleEntityConfig,
  generalConfig: GeneralConfig,
  info: TInfo,
  resolverOptions: TResolverOptions,
): {
  info: TInfo | InfoEssence;
  resolverOptions: TResolverOptions & {
    subscriptionEntityNames?: Partial<Record<SubscriptionInvolvedEntityNames, string>>;
  };
} => {
  const { name } = entityConfig;

  // nothing to publish if nobody may subscribe (and no "pubsub" is required then)
  if (!checkInventory(['Subscription', `${kind}Entity`, name], generalConfig.inventory)) {
    return { info, resolverOptions };
  }

  return {
    // the previous state is read with the projection of "info": all fields make "previousNode" and
    // "updatedFields" complete, the selection of the client stays in "infoEssence" for the result
    info:
      kind === 'created'
        ? info
        : createInfoEssence({
            projection: composeAllFieldsProjection(entityConfig, WITHOUT_CALCULATED_WITH_ASYNC),
            entityConfig,
            infoEssence: info ? getInfoEssence(entityConfig, info) : undefined,
          }),

    resolverOptions: {
      ...resolverOptions,
      subscriptionEntityNames: { [subscriptionEntityNameKeys[kind]]: name },
    },
  };
};

export default composeSubscriptionReportArgs;
