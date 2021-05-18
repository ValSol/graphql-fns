// @flow

import createManyThings from '../createCreateManyThingsMutationResolver/resolverAttributes';
import createThing from '../createCreateThingMutationResolver/resolverAttributes';
import deleteFilteredThings from '../createDeleteFilteredThingsMutationResolver/resolverAttributes';
import deleteManyThings from '../createDeleteManyThingsMutationResolver/resolverAttributes';
import deleteThing from '../createDeleteThingMutationResolver/resolverAttributes';
import importThings from '../createImportThingsMutationResolver/resolverAttributes';
import pushIntoThing from '../createPushIntoThingMutationResolver/resolverAttributes';
import updateFilteredThings from '../createUpdateFilteredThingsMutationResolver/resolverAttributes';
import updateManyThings from '../createUpdateManyThingsMutationResolver/resolverAttributes';
import updateThing from '../createUpdateThingMutationResolver/resolverAttributes';
import uploadFilesToThing from '../createUploadFilesToThingMutationResolver/resolverAttributes';

const mutationsResolverAttributes = {
  createManyThings,
  createThing,
  deleteFilteredThings,
  deleteManyThings,
  deleteThing,
  importThings,
  pushIntoThing,
  updateFilteredThings,
  updateManyThings,
  updateThing,
  uploadFilesToThing,
};

export default mutationsResolverAttributes;
