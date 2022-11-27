// @flow

import type { ActionAttributes } from '../../flowTypes';

import childEntity from './childEntityQueryAttributes';
import childEntities from './childEntitiesQueryAttributes';
import copyManyEntities from './copyManyEntitiesMutationAttributes';
import copyManyEntitiesWithChildren from './copyManyEntitiesWithChildrenMutationAttributes';
import copyEntity from './copyEntityMutationAttributes';
import copyEntityWithChildren from './copyEntityWithChildrenMutationAttributes';
import createManyEntities from './createManyEntitiesMutationAttributes';
import entityDistinctValues from './entityDistinctValuesQueryAttributes';
import entityCount from './entityCountQueryAttributes';
import entityFileCount from './entityFileCountQueryAttributes';
import entityFile from './entityFileQueryAttributes';
import entityFiles from './entityFilesQueryAttributes';
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
import importEntities from './importEntitiesMutationAttributes';
import pushIntoEntity from './pushIntoEntityMutationAttributes';
import updateFilteredEntities from './updateFilteredEntitiesMutationAttributes';
import updateFilteredEntitiesReturnScalar from './updateFilteredEntitiesReturnScalarMutationAttributes';
import updateManyEntities from './updateManyEntitiesMutationAttributes';
import updateEntity from './updateEntityMutationAttributes';
import uploadFilesToEntity from './uploadFilesToEntityMutationAttributes';
import uploadEntityFiles from './uploadEntityFilesMutationAttributes';

const actionAttributes = {
  childEntity,
  childEntities,
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
  entityCount,
  entityDistinctValues,
  entityFileCount,
  entityFile,
  entityFiles,
  entity,
  entities,
  entitiesThroughConnection,
  entitiesByUnique,
  updateFilteredEntities,
  updateFilteredEntitiesReturnScalar,
  updateManyEntities,
  updateEntity,
  uploadFilesToEntity,
  uploadEntityFiles,
};

const mutationAttributes: { [actionName: string]: ActionAttributes } = Object.keys(
  actionAttributes,
).reduce((prev, actionName) => {
  if (actionAttributes[actionName].actionType === 'Mutation') {
    prev[actionName] = actionAttributes[actionName]; // eslint-disable-line no-param-reassign
  }
  return prev;
}, {});

const queryAttributes: { [actionName: string]: ActionAttributes } = Object.keys(
  actionAttributes,
).reduce((prev, actionName) => {
  if (actionAttributes[actionName].actionType === 'Query') {
    prev[actionName] = actionAttributes[actionName]; // eslint-disable-line no-param-reassign
  }
  return prev;
}, {});

export { mutationAttributes, queryAttributes };
export default actionAttributes;
