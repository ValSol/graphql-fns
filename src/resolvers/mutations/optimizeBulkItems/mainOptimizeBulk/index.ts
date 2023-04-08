import categorizeBulkOperations from './categorizeBulkOperations';

const deleteAfterInsert = (id: any, categorizedBulkOperations: any) => {
  // indexes added by "unshift" so last index is on the first place
  const lastDeleteIndex = categorizedBulkOperations.deleteOne[id];
  const lastInsertIndex =
    categorizedBulkOperations.insertOne && categorizedBulkOperations.insertOne[id]
      ? categorizedBulkOperations.insertOne[id]
      : -1;

  return lastDeleteIndex > lastInsertIndex;
};

const insertAfterDeleteAndIndexAfterLastInsert = (
  index: number,
  id: any,
  categorizedBulkOperations: any,
) => {
  if (deleteAfterInsert(id, categorizedBulkOperations)) return false;
  // indexes added by "unshift" so last index is on the first place
  const lastInsertIndex = categorizedBulkOperations.insertOne[id];

  return index > lastInsertIndex;
};

const insertAfterDeleteAndIndexEqualLastDelete = (
  index: number,
  id: any,
  categorizedBulkOperations: any,
) => {
  if (deleteAfterInsert(id, categorizedBulkOperations)) return false;
  // indexes added by "unshift" so last index is on the first place
  const lastDeleteIndex = categorizedBulkOperations.deleteOne[id];

  return index === lastDeleteIndex;
};

const insertAfterDeleteAndIndexEqualLastInsert = (
  index: number,
  id: any,
  categorizedBulkOperations: any,
) => {
  if (deleteAfterInsert(id, categorizedBulkOperations)) return false;
  // indexes added by "unshift" so last index is on the first place
  const lastInsertIndex = categorizedBulkOperations.insertOne[id];

  return index === lastInsertIndex;
};

const mainOptimizeBulk = (preparedData: Array<any>): Array<any> => {
  const categorizedBulkOperations = categorizeBulkOperations(preparedData);

  const result: Array<
    | any
    | {
        deleteMany: {
          filter: {
            _id: {
              $in: Array<any>;
            };
          };
        };
      }
  > = [];
  const idsForDelete: Array<any> = [];
  preparedData.forEach((item, i) => {
    const { deleteOne, insertOne, updateOne } = item;

    if (insertOne) {
      const {
        document: { _id: id },
      } = insertOne;
      if (
        categorizedBulkOperations.deleteOne[id] === undefined ||
        insertAfterDeleteAndIndexEqualLastInsert(i, id, categorizedBulkOperations)
      ) {
        result.push(item);
      }
    } else if (updateOne) {
      const {
        filter: { _id: id },
      } = updateOne;
      if (
        categorizedBulkOperations.deleteOne[id] === undefined ||
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
    } else {
      result.push(item); // updateMany
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

export default mainOptimizeBulk;
