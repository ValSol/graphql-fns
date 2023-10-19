import type { DescendantAttributes } from '../../tsTypes';

const connectionDescendantUpdater = (entityName: string, item: DescendantAttributes) => {
  const edgeName = `${entityName}Edge`;

  const connectionName = `${entityName}Connection`;

  if (!item.allow[edgeName]) {
    item.allow = { ...item.allow, [edgeName]: [] }; // eslint-disable-line no-param-reassign
  }

  if (!item.allow[connectionName]) {
    item.allow = { ...item.allow, [connectionName]: [] }; // eslint-disable-line no-param-reassign
  }
};

export default connectionDescendantUpdater;
