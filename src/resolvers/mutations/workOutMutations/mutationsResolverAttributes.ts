import copyManyEntities from '../createCopyManyEntitiesMutationResolver/resolverAttributes';
import copyManyEntitiesWithChildren from '../createCopyManyEntitiesWithChildrenMutationResolver/resolverAttributes';
import copyEntity from '../createCopyEntityMutationResolver/resolverAttributes';
import copyEntityWithChildren from '../createCopyEntityWithChildrenMutationResolver/resolverAttributes';
import createManyEntities from '../createCreateManyEntitiesMutationResolver/resolverAttributes';
import createEntity from '../createCreateEntityMutationResolver/resolverAttributes';
import deleteEntity from '../createDeleteEntityMutationResolver/resolverAttributes';
import deleteEntityWithChildren from '../createDeleteEntityWithChildrenMutationResolver/resolverAttributes';
import deleteFilteredEntities from '../createDeleteFilteredEntitiesMutationResolver/resolverAttributes';
import deleteFilteredEntitiesReturnScalar from '../createDeleteFilteredEntitiesReturnScalarMutationResolver/resolverAttributes';
import deleteFilteredEntitiesWithChildren from '../createDeleteFilteredEntitiesWithChildrenMutationResolver/resolverAttributes';
import deleteFilteredEntitiesWithChildrenReturnScalar from '../createDeleteFilteredEntitiesWithChildrenReturnScalarMutationResolver/resolverAttributes';
import deleteManyEntities from '../createDeleteManyEntitiesMutationResolver/resolverAttributes';
import deleteManyEntitiesWithChildren from '../createDeleteManyEntitiesWithChildrenMutationResolver/resolverAttributes';
import importEntities from '../createImportEntitiesMutationResolver/resolverAttributes';
import pushIntoEntity from '../createPushIntoEntityMutationResolver/resolverAttributes';
import updateFilteredEntities from '../createUpdateFilteredEntitiesMutationResolver/resolverAttributes';
import updateFilteredEntitiesReturnScalar from '../createUpdateFilteredEntitiesReturnScalarMutationResolver/resolverAttributes';
import updateManyEntities from '../createUpdateManyEntitiesMutationResolver/resolverAttributes';
import updateEntity from '../createUpdateEntityMutationResolver/resolverAttributes';

const mutationsResolverAttributes = {
  copyManyEntities,
  copyManyEntitiesWithChildren,
  copyEntity,
  copyEntityWithChildren,
  createManyEntities,
  createEntity,
  deleteFilteredEntities,
  deleteFilteredEntitiesReturnScalar,
  deleteFilteredEntitiesWithChildren,
  deleteFilteredEntitiesWithChildrenReturnScalar,
  deleteManyEntities,
  deleteManyEntitiesWithChildren,
  deleteEntity,
  deleteEntityWithChildren,
  importEntities,
  pushIntoEntity,
  updateFilteredEntities,
  updateFilteredEntitiesReturnScalar,
  updateManyEntities,
  updateEntity,
} as const;

export default mutationsResolverAttributes;
