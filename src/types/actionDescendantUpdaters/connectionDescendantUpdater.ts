import type { DescendantAttributes, EntityConfig } from '@/tsTypes';

const connectionDescendantUpdater = (entityConfig: EntityConfig, item: DescendantAttributes) => {
  const { name: entityName } = entityConfig;

  const edgeName = `${entityName}Edge`;

  const connectionName = `${entityName}Connection`;

  if (!item.allow[edgeName]) {
    item.allow = { ...item.allow, [edgeName]: [] };
  }

  if (!item.allow[connectionName]) {
    item.allow = { ...item.allow, [connectionName]: [] };
  }
};

export default connectionDescendantUpdater;
