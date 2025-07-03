type Result = {
  insertOne: {
    [_id: string]: number;
  };
  deleteOne: {
    [_id: string]: number;
  };
  // updateOne: { [_id: string]: Array<number> },
};

const categorizeBulkOperations = (preparedData: Array<any>): Result =>
  preparedData.reduce(
    (prev, item, i) => {
      const { updateOne, updateMany, insertOne, deleteOne, deleteMany } = item;
      if (deleteOne) {
        const { filter } = deleteOne;

        prev.deleteOne[filter._id] = i; // eslint-disable-line no-underscore-dangle, no-param-reassign
      } else if (insertOne) {
        const { document: filter } = insertOne;

        prev.insertOne[filter._id] = i; // eslint-disable-line no-underscore-dangle, no-param-reassign
      } else if (!(updateOne || updateMany || deleteMany)) {
        throw new TypeError(
          `Got bulk item: ${JSON.stringify(
            item,
          )} that not "updateOne" or "updateMany" or "deleteOne" or "insertOne"!`,
        );
      }
      return prev;
    },
    {
      insertOne: {},
      deleteOne: {},
    },
  );

export default categorizeBulkOperations;
