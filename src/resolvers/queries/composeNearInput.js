// @flow
import type { NearInput, NearMongodb } from '../../flowTypes';

const composeWhereInput = (near: NearInput): NearMongodb => {
  const {
    geospatialField,
    coordinates: { lng, lat },
    maxDistance: $maxDistance,
  } = near;
  return {
    [`${geospatialField}.coordinates`]: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        $maxDistance,
      },
    },
  };
};

export default composeWhereInput;
