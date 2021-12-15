// @flow

import copyThing from '../createCopyThingMutationResolver/resolverAttributes';
import createManyThings from '../createCreateManyThingsMutationResolver/resolverAttributes';
import createThing from '../createCreateThingMutationResolver/resolverAttributes';
import deleteThing from '../createDeleteThingMutationResolver/resolverAttributes';
import deleteThingWithChildren from '../createDeleteThingWithChildrenMutationResolver/resolverAttributes';
import deleteFilteredThings from '../createDeleteFilteredThingsMutationResolver/resolverAttributes';
import deleteFilteredThingsReturnScalar from '../createDeleteFilteredThingsReturnScalarMutationResolver/resolverAttributes';
import deleteFilteredThingsWithChildren from '../createDeleteFilteredThingsWithChildrenMutationResolver/resolverAttributes';
import deleteFilteredThingsWithChildrenReturnScalar from '../createDeleteFilteredThingsWithChildrenReturnScalarMutationResolver/resolverAttributes';
import deleteManyThings from '../createDeleteManyThingsMutationResolver/resolverAttributes';
import deleteManyThingsWithChildren from '../createDeleteManyThingsWithChildrenMutationResolver/resolverAttributes';
import importThings from '../createImportThingsMutationResolver/resolverAttributes';
import pushIntoThing from '../createPushIntoThingMutationResolver/resolverAttributes';
import updateFilteredThings from '../createUpdateFilteredThingsMutationResolver/resolverAttributes';
import updateFilteredThingsReturnScalar from '../createUpdateFilteredThingsReturnScalarMutationResolver/resolverAttributes';
import updateManyThings from '../createUpdateManyThingsMutationResolver/resolverAttributes';
import updateThing from '../createUpdateThingMutationResolver/resolverAttributes';
import uploadFilesToThing from '../createUploadFilesToThingMutationResolver/resolverAttributes';

const mutationsResolverAttributes = {
  copyThing,
  createManyThings,
  createThing,
  deleteFilteredThings,
  deleteFilteredThingsReturnScalar,
  deleteFilteredThingsWithChildren,
  deleteFilteredThingsWithChildrenReturnScalar,
  deleteManyThings,
  deleteManyThingsWithChildren,
  deleteThing,
  deleteThingWithChildren,
  importThings,
  pushIntoThing,
  updateFilteredThings,
  updateFilteredThingsReturnScalar,
  updateManyThings,
  updateThing,
  uploadFilesToThing,
};

export default mutationsResolverAttributes;
