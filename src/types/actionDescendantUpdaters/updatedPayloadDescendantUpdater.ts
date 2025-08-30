import type { DescendantAttributes } from '@/tsTypes';

const updatedPayloadDescendantUpdater = (entityName: string, item: DescendantAttributes) => {
  const updatedPayloadName = `${entityName}UpdatedPayload`;

  if (!item.allow[updatedPayloadName]) {
    item.allow = { ...item.allow, [updatedPayloadName]: [] };
  }
};

export default updatedPayloadDescendantUpdater;
