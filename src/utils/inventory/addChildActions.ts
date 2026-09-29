import type { GeneralConfig, Inventory } from '@/tsTypes';

import { queryAttributes } from '@/types/actionAttributes';
import unwindInverntoryOptions from './unwindInverntoryOptions';

// root query -> child query that shows the same entities in fields of other entities
const rootToChildQueries = {
  entity: 'childEntity',
  entities: 'childEntities',
  entitiesThroughConnection: 'childEntitiesThroughConnection',
  entityCount: 'childEntityCount',
  entityDistinctValues: 'childEntityDistinctValues',
};

// child fields ("Country.cities") are child queries of the target entity ("childEntities" of "City"), so...
// ... "include" that lists only root queries hides them; this adds child queries...
// ... for every entity whose root query is included (also for representations)
const addChildActions = (inventory: Inventory, generalConfig: GeneralConfig): Inventory => {
  const { name, include } = inventory;

  // "true" or absent "include" (or "Query") already allows every query
  if (typeof include !== 'object' || !include.Query || include.Query === true) {
    return inventory;
  }

  const { Query: includedQueries } = unwindInverntoryOptions(
    { Query: include.Query },
    generalConfig,
    name,
    'include',
  );

  const { Query: allQueries } = unwindInverntoryOptions({ Query: true }, generalConfig);

  const representationKeys = ['', ...Object.keys(generalConfig.representations || {})];

  const Query = { ...include.Query };

  representationKeys.forEach((representationKey) => {
    Object.keys(rootToChildQueries).forEach((rootName) => {
      const rootQueryName = queryAttributes[rootName].actionGeneralName(representationKey);
      const childQueryName =
        queryAttributes[rootToChildQueries[rootName]].actionGeneralName(representationKey);

      const entityNames = (includedQueries[rootQueryName] || []).filter((entityName) =>
        allQueries[childQueryName]?.includes(entityName),
      );

      const current = Query[childQueryName];

      if (entityNames.length === 0 || current === true) return;

      Query[childQueryName] = [
        ...(current || []),
        ...entityNames.filter((entityName) => !current?.includes(entityName)),
      ];
    });
  });

  return { ...inventory, include: { ...include, Query } };
};

export default addChildActions;
