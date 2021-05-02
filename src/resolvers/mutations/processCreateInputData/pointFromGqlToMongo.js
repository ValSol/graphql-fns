// @flow

import type { GeospatialPoint, MongodbGeospatialPoint } from '../../../flowTypes';

const renumeratePositions = (point: GeospatialPoint | null): MongodbGeospatialPoint | null => {
  if (point === null) return null;

  const { lng, lat } = point;

  return { type: 'Point', coordinates: [lng, lat] };
};

export default renumeratePositions;
