import type { MongodbGeospatialPolygon } from '@/tsTypes';

const earthRadius = 6378137;

function createCirclePolygonCoordinates(
  { lat, lng }: { lat: number; lng: number },
  radius: number, // in meters
  steps: number,
): [number, number][][] {
  const coords: [number, number][] = [];

  for (let i = 0; i <= steps; i++) {
    const angle = (2 * Math.PI * i) / steps;

    const dx = radius * Math.cos(angle);
    const dy = radius * Math.sin(angle);

    const newLat = lat + (dy / earthRadius) * (180 / Math.PI);

    const newLng = lng + (dx / (earthRadius * Math.cos((lat * Math.PI) / 180))) * (180 / Math.PI);

    coords.push([newLng, newLat]);
  }

  return [coords];
}

const composeCircleApproximatedByPolygon = ({
  center,
  radius,
  steps = 64,
}: {
  center: { lat: number; lng: number };
  radius: number;
  steps?: number;
}): MongodbGeospatialPolygon | null => {
  if (steps < 4) {
    throw new TypeError(`Got steps: "${steps}" but have to be more than "3"!`);
  }

  const coordinates = createCirclePolygonCoordinates(center, radius, steps);

  return { coordinates, type: 'Polygon' as const };
};

export default composeCircleApproximatedByPolygon;
