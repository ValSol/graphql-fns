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

const composeLimitingArgs = (args: Args, thing: any): Args => {
  const { near, sort, where } = args;

  const result: Args = { ...args }; // to define type and prevent type error

  if (!near && !sort) {
    return args;
  }

  let noNearOrWhereChanged = true;

  if (sort?.sortBy) {
    const surroundingsWhere = sort.sortBy.reduce<Record<string, any>>((prev, sortField) => {
      const [fieldName, direction] = sortField.split('_');

      if (thing[fieldName] !== null) {
        if (direction === 'ASC') {
          prev[`${fieldName}_lte`] = thing[fieldName];
        } else if (direction === 'DESC') {
          prev[`${fieldName}_gte`] = thing[fieldName];
        } else {
          throw new TypeError(`Incorrect sort direction: "${direction}"`);
        }

        noNearOrWhereChanged = false;
      }

      return prev;
    }, {});

    result.where = where ? { AND: [where, surroundingsWhere] } : surroundingsWhere;
  }

  if (near) {
    const {
      geospatialField,
      coordinates: { lng, lat },
      maxDistance = Infinity,
    } = near;

    const {
      coordinates: [cursorLng, cursorLat],
    } = thing[geospatialField];

    const distance = getDistanceFromLatLng(lat, lng, cursorLat, cursorLng);

    result.near = {
      geospatialField,
      coordinates: { lng, lat },
      maxDistance: Math.min(distance * (1 + 0.002), maxDistance),
    };

    noNearOrWhereChanged = false;
  }

  if (noNearOrWhereChanged) {
    return args;
  }

  return result;
};

export default composeLimitingArgs;
