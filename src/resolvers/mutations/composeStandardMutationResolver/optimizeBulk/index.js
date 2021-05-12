// @flow

import categorizeBulkOperations from './categorizeBulkOperations';

const deleteAfterInsert = (id, categorizedBulkOperations) => {
  // indexes added by "unshift" so last index is on the first place
  const lastDeleteIndex = categorizedBulkOperations.deleteOne[id];
  const lastInsertIndex =
    categorizedBulkOperations.insertOne && categorizedBulkOperations.insertOne[id]
      ? categorizedBulkOperations.insertOne[id]
      : -1;

  return lastDeleteIndex > lastInsertIndex;
};

const insertAfterDeleteAndIndexAfterLastInsert = (index, id, categorizedBulkOperations) => {
  if (deleteAfterInsert(id, categorizedBulkOperations)) return false;
  // indexes added by "unshift" so last index is on the first place
  const lastInsertIndex = categorizedBulkOperations.insertOne[id];

  return index > lastInsertIndex;
};

const insertAfterDeleteAndIndexEqualLastDelete = (index, id, categorizedBulkOperations) => {
  if (deleteAfterInsert(id, categorizedBulkOperations)) return false;
  // indexes added by "unshift" so last index is on the first place
  const lastDeleteIndex = categorizedBulkOperations.deleteOne[id];

  return index === lastDeleteIndex;
};

const insertAfterDeleteAndIndexEqualLastInsert = (index, id, categorizedBulkOperations) => {
  if (deleteAfterInsert(id, categorizedBulkOperations)) return false;
  // indexes added by "unshift" so last index is on the first place
  const lastInsertIndex = categorizedBulkOperations.insertOne[id];

  return index === lastInsertIndex;
};

const optimizeBulk = (preparedData: Array<Object>): Array<Object> => {
  const categorizedBulkOperations = categorizeBulkOperations(preparedData);

  const result = [];
  const idsForDelete = [];
  preparedData.forEach((item, i) => {
    const { deleteOne, insertOne, updateOne } = item;

    if (insertOne) {
      const {
        document: { _id: id },
      } = insertOne;
      if (
        !categorizedBulkOperations.deleteOne[id] ||
        insertAfterDeleteAndIndexEqualLastInsert(i, id, categorizedBulkOperations)
      ) {
        result.push(item);
      }
    } else if (updateOne) {
      const {
        filter: { _id: id },
      } = updateOne;
      if (
        !categorizedBulkOperations.deleteOne[id] ||
        insertAfterDeleteAndIndexAfterLastInsert(i, id, categorizedBulkOperations)
      ) {
        result.push(item);
      }
    } else if (deleteOne) {
      const {
        filter: { _id: id },
      } = deleteOne;
      if (insertAfterDeleteAndIndexEqualLastDelete(i, id, categorizedBulkOperations)) {
        result.push(item);
      } else if (deleteAfterInsert(id, categorizedBulkOperations) && !idsForDelete.includes(id)) {
        idsForDelete.push(id);
      }
    }
  });

  if (idsForDelete.length) {
    result.push({
      deleteMany: {
        filter: {
          _id: { $in: idsForDelete },
        },
      },
    });
  }

  return result;
};

export default optimizeBulk;
