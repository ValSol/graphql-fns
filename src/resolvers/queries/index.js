// @flow

import childEntities from './createChildEntitiesQueryResolver';
import childEntity from './createChildEntityQueryResolver';
import entities from './createEntitiesQueryResolver';
import entitiesByUnique from './createEntitiesByUniqueQueryResolver';
import entitiesThroughConnection from './createEntitiesThroughConnectionQueryResolver';
import entity from './createEntityQueryResolver';
import entityDistinctValues from './createEntityDistinctValuesQueryResolver';
import entityCount from './createEntityCountQueryResolver';
import entityFile from './createEntityFileQueryResolver';
import entityFileCount from './createEntityFileCountQueryResolver';
import entityFiles from './createEntityFilesQueryResolver';
import entityFilesThroughConnection from './createEntityFilesThroughConnectionQueryResolver';

const queries = {
  childEntity,
  childEntities,
  entityCount,
  entityDistinctValues,
  entityFileCount,
  entityFile,
  entityFiles,
  entityFilesThroughConnection,
  entity,
  entities,
  entitiesThroughConnection,
  entitiesByUnique,
};

export default queries;
