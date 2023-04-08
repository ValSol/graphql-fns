import type {NearInput, NearMongodb} from '../../../tsTypes';

type NearSphere = {
  $geometry: {
    type: 'Point',
    coordinates: [number, number]
  },
  $maxDistance?: number,
  $minDistance?: number
};

const composeNearInput = (near: NearInput): NearMongodb => {
  const {
    geospatialField,
    coordinates: { lng, lat },
    maxDistance,
    minDistance,
  } = near;

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
    [`${geospatialField}.coordinates`]: {
      $nearSphere,
    },
  };
};

export default composeNearInput;
