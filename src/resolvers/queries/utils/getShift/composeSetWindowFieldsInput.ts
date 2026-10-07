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

// the number of the documents up to the current one; unlike "$documentNumber", works with several sort keys
const COUNT_UP_TO_CURRENT = { $sum: 1, window: { documents: ['unbounded', 'current'] } } as const;

const composeSetWindowFieldsInput = (arg: Args): SetWindowFields => {
  const { near, sort } = arg;

  if (sort && sort?.sortBy.length) {
    const sortBy = sort.sortBy.reduce<Record<string, any>>((prev, sortKey) => {
      const [preFieldName, distance] = sortKey.split('_');

      const fieldName = preFieldName === 'id' ? '_id' : preFieldName;

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
        calculated_number: COUNT_UP_TO_CURRENT,
      },
    };
  }

  if (near) {
    return {
      sortBy: { [`${near.geospatialField}_distance`]: 1 },
      output: {
        calculated_number: COUNT_UP_TO_CURRENT,
      },
    };
  }

  return {
    sortBy: { not_existed_field: 1 },
    output: {
      calculated_number: COUNT_UP_TO_CURRENT,
    },
  };
};

export default composeSetWindowFieldsInput;
