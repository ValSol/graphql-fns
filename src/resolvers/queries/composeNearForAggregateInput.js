// @flow
import type { NearInput, NearForAggregateMongodb } from '../../flowTypes';

const composeNearForAggregateInput = (near: NearInput): NearForAggregateMongodb => {
  const {
    geospatialField,
    coordinates: { lng, lat },
    maxDistance,
  } = near;
  return {
    near: { type: 'Point', coordinates: [lng, lat] },
    maxDistance,
    distanceField: `${geospatialField}_distance`,
    key: `${geospatialField}.coordinates`,
    spherical: true,
  };
};

export default composeNearForAggregateInput;
