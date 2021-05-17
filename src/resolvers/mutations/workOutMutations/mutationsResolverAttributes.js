// @flow

import createManyThings from '../createCreateManyThingsMutationResolver/resolverAttributes';
import createThing from '../createCreateThingMutationResolver/resolverAttributes';
import deleteManyThings from '../createDeleteManyThingsMutationResolver/resolverAttributes';
import deleteThing from '../createDeleteThingMutationResolver/resolverAttributes';
import importThings from '../createImportThingsMutationResolver/resolverAttributes';
import pushIntoThing from '../createPushIntoThingMutationResolver/resolverAttributes';
import updateManyThings from '../createUpdateManyThingsMutationResolver/resolverAttributes';
import updateThing from '../createUpdateThingMutationResolver/resolverAttributes';
import uploadFilesToThing from '../createUploadFilesToThingMutationResolver/resolverAttributes';

const mutationsResolverAttributes = {
  createManyThings,
  createThing,
  deleteManyThings,
  deleteThing,
  importThings,
  pushIntoThing,
  updateManyThings,
  updateThing,
  uploadFilesToThing,
};

export default mutationsResolverAttributes;
