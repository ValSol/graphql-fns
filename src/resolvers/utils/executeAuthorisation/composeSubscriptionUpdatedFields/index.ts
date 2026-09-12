import { GeneralConfig, ThreeSegmentInventoryChain } from '@/tsTypes';
import composeRepresentationConfigByName from '@/utils/composeRepresentationConfigByName';
import composeFieldsObject, { WITHOUT_CALCULATED_WITH_ASYNC } from '@/utils/composeFieldsObject';

const composeSubscriptionUpdatedFields = (
  inventoryChain: ThreeSegmentInventoryChain,
  generalConfig: GeneralConfig,
) => {
  const [actionType, actionName, entityName] = inventoryChain;

  if (!(actionType === 'Subscription' && actionName.startsWith('updated'))) {
    throw new TypeError(`Incorrect action: "${actionName}"!`);
  }

  const { allEntityConfigs } = generalConfig;

  const representationKey = actionName.slice('updatedEntity'.length);

  const entityConfig = representationKey
    ? composeRepresentationConfigByName(
        representationKey,
        allEntityConfigs[entityName],
        generalConfig,
      )
    : allEntityConfigs[entityName];

  return Object.keys(composeFieldsObject(entityConfig, WITHOUT_CALCULATED_WITH_ASYNC).fieldsObject);
};

export default composeSubscriptionUpdatedFields;
