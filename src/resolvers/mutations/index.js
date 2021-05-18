// @flow

import createManyThings from './createCreateManyThingsMutationResolver';
import createThing from './createCreateThingMutationResolver';
import deleteThing from './createDeleteThingMutationResolver';
import deleteFilteredThings from './createDeleteFilteredThingsMutationResolver';
import deleteManyThings from './createDeleteManyThingsMutationResolver';
import importThings from './createImportThingsMutationResolver';
import pushIntoThing from './createPushIntoThingMutationResolver';
import updateThing from './createUpdateThingMutationResolver';
import updateFilteredThings from './createUpdateFilteredThingsMutationResolver';
import updateManyThings from './createUpdateManyThingsMutationResolver';
import uploadFilesToThing from './createUploadFilesToThingMutationResolver';
import uploadThingFiles from './createUploadThingFilesMutationResolver';

const mutations = {
  createManyThings,
  createThing,
  deleteThing,
  deleteFilteredThings,
  deleteManyThings,
  importThings,
  pushIntoThing,
  updateFilteredThings,
  updateManyThings,
  updateThing,
  uploadFilesToThing,
  uploadThingFiles,
};

export default mutations;
