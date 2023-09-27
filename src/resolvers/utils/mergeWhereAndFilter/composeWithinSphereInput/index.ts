type Arg = { center: { lat: number; lng: number }; radius: number };

type WithinSphere = [[number, number], number];

const composeWithinSphereInput = ({ center: { lat, lng }, radius }: Arg): WithinSphere => [
  [lng, lat],
  radius / 6378100,
];

export default composeWithinSphereInput;
