import copyManyEntities from './createCopyManyEntitiesMutationResolver';
import copyManyEntitiesWithChildren from './createCopyManyEntitiesWithChildrenMutationResolver';
import copyEntity from './createCopyEntityMutationResolver';
import copyEntityWithChildren from './createCopyEntityWithChildrenMutationResolver';
import createManyEntities from './createCreateManyEntitiesMutationResolver';
import createEntity from './createCreateEntityMutationResolver';
import deleteEntity from './createDeleteEntityMutationResolver';
import deleteEntityWithChildren from './createDeleteEntityWithChildrenMutationResolver';
import deleteFilteredEntities from './createDeleteFilteredEntitiesMutationResolver';
import deleteFilteredEntitiesReturnScalar from './createDeleteFilteredEntitiesReturnScalarMutationResolver';
import deleteFilteredEntitiesWithChildren from './createDeleteFilteredEntitiesWithChildrenMutationResolver';
import deleteFilteredEntitiesWithChildrenReturnScalar from './createDeleteFilteredEntitiesWithChildrenReturnScalarMutationResolver';
import deleteManyEntities from './createDeleteManyEntitiesMutationResolver';
import deleteManyEntitiesWithChildren from './createDeleteManyEntitiesWithChildrenMutationResolver';
import importEntities from './createImportEntitiesMutationResolver';
import pushIntoEntity from './createPushIntoEntityMutationResolver';
import updateEntity from './createUpdateEntityMutationResolver';
import updateFilteredEntities from './createUpdateFilteredEntitiesMutationResolver';
import updateFilteredEntitiesReturnScalar from './createUpdateFilteredEntitiesReturnScalarMutationResolver';
import updateManyEntities from './createUpdateManyEntitiesMutationResolver';
import uploadEntityFiles from './createUploadEntityFilesMutationResolver';

const mutations = {
  copyManyEntities,
  copyManyEntitiesWithChildren,
  copyEntity,
  copyEntityWithChildren,
  createManyEntities,
  createEntity,
  deleteEntity,
  deleteEntityWithChildren,
  deleteFilteredEntities,
  deleteFilteredEntitiesWithChildren,
  deleteFilteredEntitiesWithChildrenReturnScalar,
  deleteFilteredEntitiesReturnScalar,
  deleteManyEntities,
  deleteManyEntitiesWithChildren,
  importEntities,
  pushIntoEntity,
  updateFilteredEntities,
  updateFilteredEntitiesReturnScalar,
  updateManyEntities,
  updateEntity,
  uploadEntityFiles,
} as const;

export default mutations;
