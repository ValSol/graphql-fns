// @flow
import type { NearInput, NearMongodb } from '../../flowTypes';

const composeNearInput = (near: NearInput): NearMongodb => {
  const {
    geospatialField,
    coordinates: { longitude, latitude },
    maxDistance: $maxDistance,
  } = near;
  return {
    [`${geospatialField}.coordinates`]: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance,
      },
    },
  };
};

export default composeNearInput;
