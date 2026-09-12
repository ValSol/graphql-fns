import type { RepresentationAttributes, EntityConfig, TangibleEntityConfig } from '@/tsTypes';

const updatedPayloadRepresentationUpdater = (
  entityConfig: EntityConfig,
  item: RepresentationAttributes,
) => {
  const { name: entityName, subscriptionActorConfig } = entityConfig as TangibleEntityConfig;

  const updatedPayloadName = `${entityName}UpdatedPayload`;

  if (!item.allow[updatedPayloadName]) {
    item.allow = { ...item.allow, [updatedPayloadName]: [] };
  }

  if (subscriptionActorConfig && !item.allow[subscriptionActorConfig.name]) {
    item.allow = { ...item.allow, [subscriptionActorConfig.name]: [] };
  }
};

export default updatedPayloadRepresentationUpdater;
