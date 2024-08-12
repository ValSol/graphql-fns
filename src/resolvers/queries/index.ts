import childEntities from './createChildEntitiesQueryResolver';
import childEntitiesThroughConnection from './createChildEntitiesThroughConnectionQueryResolver';
import childEntity from './createChildEntityQueryResolver';
import childEntityCount from './createChildEntityCountQueryResolver';
import childEntityDistinctValues from './createChildEntityDistinctValuesQueryResolver';
import childEntityGetOrCreate from './createChildEntityGetOrCreateQueryResolver';
import entities from './createEntitiesQueryResolver';
import entitiesByUnique from './createEntitiesByUniqueQueryResolver';
import entitiesThroughConnection from './createEntitiesThroughConnectionQueryResolver';
import entity from './createEntityQueryResolver';
import entityDistinctValues from './createEntityDistinctValuesQueryResolver';
import entityCount from './createEntityCountQueryResolver';

const queries = {
  childEntities,
  childEntitiesThroughConnection,
  childEntity,
  childEntityCount,
  childEntityDistinctValues,
  childEntityGetOrCreate,
  entityCount,
  entityDistinctValues,
  entity,
  entities,
  entitiesThroughConnection,
  entitiesByUnique,
} as const;

export default queries;
