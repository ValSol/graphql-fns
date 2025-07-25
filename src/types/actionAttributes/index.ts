import type { ActionAttributes } from '../../tsTypes';

import arrayEntitiesThroughConnection from './arrayEntitiesThroughConnectionQueryAttributes';
import arrayEntityCount from './arrayEntityCountQueryAttributes';
import childEntity from './childEntityQueryAttributes';
import childEntityCount from './childEntityCountQueryAttributes';
import childEntityDistinctValues from './childEntityDistinctValuesQueryAttributes';
import childEntityGetOrCreate from './childEntityGetOrCreateQueryAttributes';
import childEntities from './childEntitiesQueryAttributes';
import childEntitiesThroughConnection from './childEntitiesThroughConnectionQueryAttributes';
// import cloneEntity from './cloneEntityMutationAttributes';
import copyManyEntities from './copyManyEntitiesMutationAttributes';
import copyManyEntitiesWithChildren from './copyManyEntitiesWithChildrenMutationAttributes';
import copyEntity from './copyEntityMutationAttributes';
import copyEntityWithChildren from './copyEntityWithChildrenMutationAttributes';
import createManyEntities from './createManyEntitiesMutationAttributes';
import entityDistinctValues from './entityDistinctValuesQueryAttributes';
import entityCount from './entityCountQueryAttributes';
import entity from './entityQueryAttributes';
import entities from './entitiesQueryAttributes';
import entitiesThroughConnection from './entitiesThroughConnectionQueryAttributes';
import entitiesByUnique from './entitiesByUniqueQueryAttributes';
import createEntity from './createEntityMutationAttributes';
import deleteFilteredEntities from './deleteFilteredEntitiesMutationAttributes';
import deleteFilteredEntitiesReturnScalar from './deleteFilteredEntitiesReturnScalarMutationAttributes';
import deleteFilteredEntitiesWithChildren from './deleteFilteredEntitiesWithChildrenMutationAttributes';
import deleteFilteredEntitiesWithChildrenReturnScalar from './deleteFilteredEntitiesWithChildrenReturnScalarMutationAttributes';
import deleteManyEntities from './deleteManyEntitiesMutationAttributes';
import deleteManyEntitiesWithChildren from './deleteManyEntitiesWithChildrenMutationAttributes';
import deleteEntity from './deleteEntityMutationAttributes';
import deleteEntityWithChildren from './deleteEntityWithChildrenMutationAttributes';
import pushIntoEntity from './pushIntoEntityMutationAttributes';
import updateFilteredEntities from './updateFilteredEntitiesMutationAttributes';
import updateFilteredEntitiesReturnScalar from './updateFilteredEntitiesReturnScalarMutationAttributes';
import updateManyEntities from './updateManyEntitiesMutationAttributes';
import updateEntity from './updateEntityMutationAttributes';

const actionAttributes = {
  arrayEntitiesThroughConnection,
  arrayEntityCount,
  childEntity,
  childEntityCount,
  childEntityDistinctValues,
  childEntityGetOrCreate,
  childEntities,
  childEntitiesThroughConnection,
  // cloneEntity,
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
  pushIntoEntity,
  entityCount,
  entityDistinctValues,
  entity,
  entities,
  entitiesThroughConnection,
  entitiesByUnique,
  updateFilteredEntities,
  updateFilteredEntitiesReturnScalar,
  updateManyEntities,
  updateEntity,
} as const;

const {
  mutationAttributes,
  queryAttributes,
}: {
  mutationAttributes: {
    [actionName: string]: ActionAttributes;
  };
  queryAttributes: {
    [actionName: string]: ActionAttributes;
  };
} = Object.keys(actionAttributes).reduce(
  (prev, actionName) => {
    if (actionAttributes[actionName].actionType === 'Mutation') {
      prev.mutationAttributes[actionName] = actionAttributes[actionName];
    } else if (actionAttributes[actionName].actionType === 'Query') {
      prev.queryAttributes[actionName] = actionAttributes[actionName];
    }

    return prev;
  },
  {
    mutationAttributes: {},
    queryAttributes: {},
  },
);

export { mutationAttributes, queryAttributes };
export default actionAttributes;
