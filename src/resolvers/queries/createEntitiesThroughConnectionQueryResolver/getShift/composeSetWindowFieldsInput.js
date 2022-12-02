// @flow
import type { NearInput } from '../../../../flowTypes';

type Args = {
  where?: Object,
  near?: NearInput,
  sort?: { sortBy: Array<string> },
  search?: string,
  after?: string,
  before?: string,
  first?: number,
  last?: number,
};

type SetWindowFields = {
  sortBy: { [calculated_distance: string]: 1 },
  output: {
    calculated_number: {
      $documentNumber: {},
    },
  },
};

const composeSetWindowFieldsInput = (arg: Args): SetWindowFields => {
  const { near, sort } = arg;

  if (sort && sort?.sortBy.length) {
    const sortBy = sort.sortBy.reduce((prev, sortKey) => {
      const [fieldName, distance] = sortKey.split('_');

      if (distance === 'ASC') {
        prev[fieldName] = 1; // eslint-disable-line no-param-reassign
      } else if (distance === 'DESC') {
        prev[fieldName] = -1; // eslint-disable-line no-param-reassign
      } else {
        throw new TypeError(`Incorrect sort key: "${sortKey}!"`);
      }

      return prev;
    }, {});

    return {
      sortBy,
      output: {
        calculated_number: {
          $documentNumber: {},
        },
      },
    };
  }

  if (near) {
    return {
      sortBy: { [`${near.geospatialField}_distance`]: 1 },
      output: {
        calculated_number: {
          $documentNumber: {},
        },
      },
    };
  }

  return {
    sortBy: { not_existed_field: 1 },
    output: {
      calculated_number: {
        $documentNumber: {},
      },
    },
  };
};

export default composeSetWindowFieldsInput;
