import type { DescendantAttributes } from '@/tsTypes';

const connectionDescendantUpdater = (entityName: string, item: DescendantAttributes) => {
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
