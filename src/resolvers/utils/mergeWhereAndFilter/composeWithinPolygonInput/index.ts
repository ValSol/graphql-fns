type Arg = { lat: number; lng: number }[];

type WithinPolygon = [number, number][];

const composeWithinPolygonInput = (poligon: Arg): WithinPolygon =>
  poligon.map(({ lat, lng }) => [lng, lat]);

export default composeWithinPolygonInput;
