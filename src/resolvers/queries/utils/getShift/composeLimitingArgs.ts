import type { NearInput } from '../../../../tsTypes';

import getDistanceFromLatLng from '../../../../utils/getDistanceFromLatLng';

type Args = {
  where?: any;
  near?: NearInput;
  sort?: {
    sortBy: Array<string>;
  };
  search?: string;
  after?: string;
  before?: string;
  first?: number;
  last?: number;
  // "objectIds_from_parent" used only to process the call from createEntityArrayResolver
  objectIds_from_parent?: Array<any>;
};

// narrows the set in which the position of the cursor entity is computed to the documents that can precede it;
// only for "near": a sort may have several keys and null values, so the documents preceding the cursor entity
// are not described by a range of every sort key
const composeLimitingArgs = (args: Args, thing: any): Args => {
  const { near } = args;

  if (!near) {
    return args;
  }

  const {
    geospatialField,
    coordinates: { lng, lat },
    maxDistance = Infinity,
  } = near;

  const {
    coordinates: [cursorLng, cursorLat],
  } = thing[geospatialField];

  const distance = getDistanceFromLatLng(lat, lng, cursorLat, cursorLng);

  return {
    ...args,
    near: {
      geospatialField,
      coordinates: { lng, lat },
      maxDistance: Math.min(distance * (1 + 0.002), maxDistance),
    },
  };
};

export default composeLimitingArgs;
