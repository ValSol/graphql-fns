import type { RepresentationAttributes, EntityConfig, TangibleEntityConfig } from '@/tsTypes';

const createdOrDeletedPayloadRepresentationUpdater = (
  entityConfig: EntityConfig,
  item: RepresentationAttributes,
) => {
  const { name: entityName, subscriptionActorConfig } = entityConfig as TangibleEntityConfig;

  const createdOrDeletedPayloadName = `${entityName}CreatedOrDeletedPayload`;

  if (!item.allow[createdOrDeletedPayloadName]) {
    item.allow = { ...item.allow, [createdOrDeletedPayloadName]: [] };
  }

  if (subscriptionActorConfig && !item.allow[subscriptionActorConfig.name]) {
    item.allow = { ...item.allow, [subscriptionActorConfig.name]: [] };
  }
};

export default createdOrDeletedPayloadRepresentationUpdater;
