import type {
  GeneralConfig,
  ThreeSegmentInventoryChain,
  ServersideConfig,
  ActionInvolvedEntityNames,
  TangibleEntityConfig,
} from '@/tsTypes';

import executeAuthorisation from '../executeAuthorisation';
import createInfoEssence from '../createInfoEssence';
import composeAllFieldsProjection from '../composeAllFieldsProjection';
import { WITHOUT_CALCULATED_WITH_ASYNC } from '@/utils/composeFieldsObject';
import getInfoEssence from '../getInfoEssence';

const authDecorator =
  (
    func: any,
    inventoryChain: ThreeSegmentInventoryChain,
    involvedEntityNames: ActionInvolvedEntityNames,
    generalConfig: GeneralConfig,
    serversideConfig: ServersideConfig,
  ): any =>
  async (...argarray) => {
    const [parent, args, context, info] = argarray;
    const {
      involvedFilters,
      subscriptionEntityNames,
      subscribePayloadMongoFilter,
      subscriptionUpdatedFields,
    } = await executeAuthorisation(
      inventoryChain,
      involvedEntityNames,
      args,
      context,
      generalConfig,
      serversideConfig,
    );
    if (!involvedFilters) return null;

    const [actionType, , entityName] = inventoryChain;

    // *** start expanding info for subscriptions: "updated" & "created"

    const { subscriptionDeletedEntityName, subscriptionUpdatedEntityName } =
      subscriptionEntityNames || {};

    const { allEntityConfigs } = generalConfig;
    const entityConfig = allEntityConfigs[entityName] as TangibleEntityConfig;

    const infoOrInfoEssence =
      subscriptionDeletedEntityName || subscriptionUpdatedEntityName
        ? createInfoEssence(
            composeAllFieldsProjection(entityConfig, WITHOUT_CALCULATED_WITH_ASYNC),
            entityConfig,
            getInfoEssence(entityConfig, info),
          )
        : info;

    // *** end expanding info for subscriptions: "updated" & "created"

    const result = await func(
      parent,
      args,
      context,
      infoOrInfoEssence,
      actionType === 'Subscription'
        ? { involvedFilters, subscribePayloadMongoFilter, subscriptionUpdatedFields }
        : subscriptionEntityNames
          ? { involvedFilters, subscriptionEntityNames }
          : { involvedFilters },
    );
    return result;
  };

export default authDecorator;
