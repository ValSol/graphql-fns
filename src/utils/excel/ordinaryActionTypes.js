// @flow

const ordinaryActionTypes = {
  thingCount: 'Query',
  thingDistinctValues: 'Query',
  thingFileCount: 'Query',
  thingFile: 'Query',
  thingFiles: 'Query',
  thing: 'Query',
  things: 'Query',
  importThings: 'Mutation',
  uploadFilesToThing: 'Mutation',
  createManyThings: 'Mutation',
  createThing: 'Mutation',
  deleteThing: 'Mutation',
  pushIntoThing: 'Mutation',
  updateThing: 'Mutation',
  createdThing: 'Subscription',
  deletedThing: 'Subscription',
  updatedThing: 'Subscription',
};

export default ordinaryActionTypes;
