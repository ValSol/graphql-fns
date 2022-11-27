// @flow

import childEntity from './createChildEntityQueryResolver';
import childEntities from './createChildEntitiesQueryResolver';
import entityDistinctValues from './createEntityDistinctValuesQueryResolver';
import entityCount from './createEntityCountQueryResolver';
import entityFileCount from './createEntityFileCountQueryResolver';
import entityFile from './createEntityFileQueryResolver';
import entityFiles from './createEntityFilesQueryResolver';
import entity from './createEntityQueryResolver';
import entities from './createEntitiesQueryResolver';
import entitiesThroughConnection from './createEntitiesThroughConnectionQueryResolver';
import entitiesByUnique from './createEntitiesByUniqueQueryResolver';

const queries = {
  childEntity,
  childEntities,
  entityCount,
  entityDistinctValues,
  entityFileCount,
  entityFile,
  entityFiles,
  entity,
  entities,
  entitiesThroughConnection,
  entitiesByUnique,
};

export default queries;
