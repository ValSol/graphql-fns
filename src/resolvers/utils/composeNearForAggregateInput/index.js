// @flow
import type { NearInput, NearForAggregateMongodb } from '../../../flowTypes';

const composeNearForAggregateInput = (near: NearInput): NearForAggregateMongodb => {
  const {
    geospatialField,
    coordinates: { lng, lat },
    maxDistance,
    minDistance,
  } = near;

  const result: NearForAggregateMongodb = {
    near: { type: 'Point', coordinates: [lng, lat] },
    distanceField: `${geospatialField}_distance`,
    key: `${geospatialField}.coordinates`,
    spherical: true,
  };

  if (typeof maxDistance === 'number') {
    result.maxDistance = maxDistance;
  }

  if (typeof minDistance === 'number') {
    result.minDistance = minDistance;
  }

  if (typeof maxDistance === 'undefined' && typeof minDistance === 'undefined') {
    throw new TypeError(
      `Got undefined maxDistance & minDistance in nearInput of "${geospatialField}" field!`,
    );
  }

  return result;
};

export default composeNearForAggregateInput;
