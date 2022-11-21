// @flow
import type { NearInput, NearMongodb } from '../../../flowTypes';

type NearSphere = {
  $geometry: {
    type: 'Point',
    coordinates: [number, number],
  },
  $maxDistance?: number,
  $minDistance?: number,
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

  if (typeof maxDistance === 'undefined' && typeof minDistance === 'undefined') {
    throw new TypeError(
      `Got undefined maxDistance & minDistance in nearInput of "${geospatialField}" field!`,
    );
  }

  return {
    [`${geospatialField}.coordinates`]: {
      $nearSphere,
    },
  };
};

export default composeNearInput;
