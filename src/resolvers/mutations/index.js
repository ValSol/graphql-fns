// @flow

import createManyThings from './createCreateManyThingsMutationResolver';
import createThing from './createCreateThingMutationResolver';
import deleteThing from './createDeleteThingMutationResolver';
import deleteManyThings from './createDeleteManyThingsMutationResolver';
import importThings from './createImportThingsMutationResolver';
import pushIntoThing from './createPushIntoThingMutationResolver';
import updateThing from './createUpdateThingMutationResolver';
import updateManyThings from './createUpdateManyThingsMutationResolver';
import uploadFilesToThing from './createUploadFilesToThingMutationResolver';
import uploadThingFiles from './createUploadThingFilesMutationResolver';

const mutations = {
  createManyThings,
  createThing,
  deleteThing,
  deleteManyThings,
  importThings,
  pushIntoThing,
  updateManyThings,
  updateThing,
  uploadFilesToThing,
  uploadThingFiles,
};

export default mutations;
