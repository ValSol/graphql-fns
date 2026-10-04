import type { EntityConfig, NearInput, NearMongodb } from '@/tsTypes';

import composeGeospatialKey from '@/resolvers/utils/composeGeospatialKey';

type NearSphere = {
  $geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  $maxDistance?: number;
  $minDistance?: number;
};

const composeNearInput = (near: NearInput, entityConfig: EntityConfig): NearMongodb => {
  const {
    geospatialField,
    coordinates: { lng, lat },
    maxDistance,
    minDistance,
  } = near;

  const { geospatialFields = [] } = entityConfig;

  const { geospatialType } = geospatialFields.find(({ name }) => name === geospatialField);

  const $nearSphere: NearSphere = {
    $geometry: {
      type: 'Point',
      coordinates: [lng, lat],
    },
  };

  if (typeof maxDistance === 'number') {
    $nearSphere.$maxDistance = maxDistance;
  }

  if (typeof minDistance === 'number') {
    $nearSphere.$minDistance = minDistance;
  }

  return {
    [composeGeospatialKey(geospatialField, geospatialType)]: {
      $nearSphere,
    },
  };
};

export default composeNearInput;
