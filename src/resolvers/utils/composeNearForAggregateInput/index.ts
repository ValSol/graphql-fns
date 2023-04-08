import type {NearInput, NearForAggregateMongodb} from '../../../tsTypes';

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

  return result;
};

export default composeNearForAggregateInput;
