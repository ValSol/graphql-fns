import type { NearInput, SetWindowFields } from '../../../../tsTypes';

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
};

const composeSetWindowFieldsInput = (arg: Args): SetWindowFields => {
  const { near, sort } = arg;

  if (sort && sort?.sortBy.length) {
    const sortBy = sort.sortBy.reduce<Record<string, any>>((prev, sortKey) => {
      const [fieldName, distance] = sortKey.split('_');

      if (distance === 'ASC') {
        prev[fieldName] = 1;
      } else if (distance === 'DESC') {
        prev[fieldName] = -1;
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
