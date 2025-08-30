import type { ActionAttributes } from '@/tsTypes';

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
import createdEntity from './createdEntitySubscriptionAttributes';
import createManyEntities from './createManyEntitiesMutationAttributes';
import entityDistinctValues from './entityDistinctValuesQueryAttributes';
import entityCount from './entityCountQueryAttributes';
import entity from './entityQueryAttributes';
import entities from './entitiesQueryAttributes';
import entitiesThroughConnection from './entitiesThroughConnectionQueryAttributes';
import entitiesByUnique from './entitiesByUniqueQueryAttributes';
import createEntity from './createEntityMutationAttributes';
import deletedEntity from './deletedEntitySubscriptionAttributes';
import deleteFilteredEntities from './deleteFilteredEntitiesMutationAttributes';
import deleteFilteredEntitiesReturnScalar from './deleteFilteredEntitiesReturnScalarMutationAttributes';
import deleteFilteredEntitiesWithChildren from './deleteFilteredEntitiesWithChildrenMutationAttributes';
import deleteFilteredEntitiesWithChildrenReturnScalar from './deleteFilteredEntitiesWithChildrenReturnScalarMutationAttributes';
import deleteManyEntities from './deleteManyEntitiesMutationAttributes';
import deleteManyEntitiesWithChildren from './deleteManyEntitiesWithChildrenMutationAttributes';
import deleteEntity from './deleteEntityMutationAttributes';
import deleteEntityWithChildren from './deleteEntityWithChildrenMutationAttributes';
import pushIntoEntity from './pushIntoEntityMutationAttributes';
import updatedEntity from './updatedEntitySubscriptionAttributes';
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
  createdEntity,
  createManyEntities,
  createEntity,
  deletedEntity,
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
  updatedEntity,
  updateFilteredEntities,
  updateFilteredEntitiesReturnScalar,
  updateManyEntities,
  updateEntity,
} as const;

const {
  mutationAttributes,
  queryAttributes,
  subscriptionAttributes,
}: {
  mutationAttributes: {
    [actionName: string]: ActionAttributes;
  };
  queryAttributes: {
    [actionName: string]: ActionAttributes;
  };
  subscriptionAttributes: {
    [actionName: string]: ActionAttributes;
  };
} = Object.keys(actionAttributes).reduce(
  (prev, actionName) => {
    if (actionAttributes[actionName].actionType === 'Mutation') {
      prev.mutationAttributes[actionName] = actionAttributes[actionName];
    } else if (actionAttributes[actionName].actionType === 'Query') {
      prev.queryAttributes[actionName] = actionAttributes[actionName];
    } else if (actionAttributes[actionName].actionType === 'Subscription') {
      prev.subscriptionAttributes[actionName] = actionAttributes[actionName];
    }

    return prev;
  },
  {
    mutationAttributes: {},
    queryAttributes: {},
    subscriptionAttributes: {},
  },
);

export { mutationAttributes, queryAttributes, subscriptionAttributes };
export default actionAttributes;
