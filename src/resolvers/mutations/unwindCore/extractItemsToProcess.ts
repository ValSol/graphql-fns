import type { Core } from '../../tsTypes';

const extractItemsToProcess = (core: Core) => {
  const itemsToCheck = [];

  core.forEach((bulkItems, config) => {
    bulkItems.forEach((item, i) => {
      if (!item?.updateMany || !item.updateMany.update?.$unset) {
        return;
      }

      const {
        updateMany: { filter },
      } = item;

      const [fieldName] = Object.keys(filter);

      const { required } = config.relationalFields.find(({ name }) => name === fieldName);

      if (required) {
        itemsToCheck.push([bulkItems, i, config]);
      }
    });
  });

  return itemsToCheck;
};

export default extractItemsToProcess;
