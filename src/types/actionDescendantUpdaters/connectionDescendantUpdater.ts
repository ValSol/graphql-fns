import type { DescendantAttributes } from '../../tsTypes';

const connectionDescendantUpdater = (entityName: string, item: DescendantAttributes) => {
  const { descendantKey } = item;

  const edgeName = `${entityName}Edge`;

  const connectionName = `${entityName}Connection`;

  if (!item.allow[edgeName]) {
    item.allow = { ...item.allow, [edgeName]: [] }; // eslint-disable-line no-param-reassign
  }

  if (!item.allow[connectionName]) {
    item.allow = { ...item.allow, [connectionName]: [] }; // eslint-disable-line no-param-reassign
  }

  if (!item.descendantFields) {
    item.descendantFields = {}; // eslint-disable-line no-param-reassign
  }

  if (!item.descendantFields[edgeName]) {
    item.descendantFields = { ...item.descendantFields, [edgeName]: { node: descendantKey } }; // eslint-disable-line no-param-reassign
  }

  if (!item.descendantFields[connectionName]) {
    // eslint-disable-next-line no-param-reassign
    item.descendantFields = {
      ...item.descendantFields,
      [connectionName]: { edges: descendantKey },
    };
  }
};

export default connectionDescendantUpdater;
