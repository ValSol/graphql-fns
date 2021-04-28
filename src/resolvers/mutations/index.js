// @flow

import createManyThings from './createCreateManyThingsMutationResolver';
import createThing from './createCreateThingMutationResolver';
import deleteThing from './createDeleteThingMutationResolver';
import importThings from './createImportThingsMutationResolver';
import pushIntoThing from './createPushIntoThingMutationResolver';
import updateThing from './createUpdateThingMutationResolver';
import uploadFilesToThing from './createUploadFilesToThingMutationResolver';
import uploadThingFiles from './createUploadThingFilesMutationResolver';

const mutations = {
  createManyThings,
  createThing,
  deleteThing,
  importThings,
  pushIntoThing,
  updateThing,
  uploadFilesToThing,
  uploadThingFiles,
};

export default mutations;
