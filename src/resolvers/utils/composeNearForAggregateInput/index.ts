import type { NearInput, NearForAggregateMongodb, EntityConfig } from '@/tsTypes';

import composeGeospatialKey from '@/resolvers/utils/composeGeospatialKey';

const composeNearForAggregateInput = (
  near: NearInput,
  entityConfig: EntityConfig,
): NearForAggregateMongodb => {
  const {
    geospatialField,
    coordinates: { lng, lat },
    maxDistance,
    minDistance,
  } = near;

  const { geospatialFields = [] } = entityConfig;

  const { geospatialType } = geospatialFields.find(({ name }) => name === geospatialField);

  const result: NearForAggregateMongodb = {
    near: { type: 'Point', coordinates: [lng, lat] },
    distanceField: `${geospatialField}_distance`,
    key: composeGeospatialKey(geospatialField, geospatialType),
    spherical: true,
  };

  if (typeof maxDistance === 'number') {
    result.maxDistance = maxDistance;
  }

  if (typeof minDistance === 'number') {
    result.minDistance = minDistance;
  }

  return result;
};

export default composeNearForAggregateInput;
