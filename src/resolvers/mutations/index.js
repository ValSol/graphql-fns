// @flow

import copyThing from './createCopyThingMutationResolver';
import createManyThings from './createCreateManyThingsMutationResolver';
import createThing from './createCreateThingMutationResolver';
import deleteThing from './createDeleteThingMutationResolver';
import deleteThingWithChildren from './createDeleteThingWithChildrenMutationResolver';
import deleteFilteredThings from './createDeleteFilteredThingsMutationResolver';
import deleteFilteredThingsReturnScalar from './createDeleteFilteredThingsReturnScalarMutationResolver';
import deleteFilteredThingsWithChildren from './createDeleteFilteredThingsWithChildrenMutationResolver';
import deleteFilteredThingsWithChildrenReturnScalar from './createDeleteFilteredThingsWithChildrenReturnScalarMutationResolver';
import deleteManyThings from './createDeleteManyThingsMutationResolver';
import deleteManyThingsWithChildren from './createDeleteManyThingsWithChildrenMutationResolver';
import importThings from './createImportThingsMutationResolver';
import pushIntoThing from './createPushIntoThingMutationResolver';
import updateThing from './createUpdateThingMutationResolver';
import updateFilteredThings from './createUpdateFilteredThingsMutationResolver';
import updateFilteredThingsReturnScalar from './createUpdateFilteredThingsReturnScalarMutationResolver';
import updateManyThings from './createUpdateManyThingsMutationResolver';
import uploadFilesToThing from './createUploadFilesToThingMutationResolver';
import uploadThingFiles from './createUploadThingFilesMutationResolver';

const mutations = {
  copyThing,
  createManyThings,
  createThing,
  deleteThing,
  deleteThingWithChildren,
  deleteFilteredThings,
  deleteFilteredThingsWithChildren,
  deleteFilteredThingsWithChildrenReturnScalar,
  deleteFilteredThingsReturnScalar,
  deleteManyThings,
  deleteManyThingsWithChildren,
  importThings,
  pushIntoThing,
  updateFilteredThings,
  updateFilteredThingsReturnScalar,
  updateManyThings,
  updateThing,
  uploadFilesToThing,
  uploadThingFiles,
};

export default mutations;
