import type { SetWindowFields } from '../../../../tsTypes';

import parseSortKey from '../parseSortKey';

type Args = {
  where?: any;
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
  const { sort } = arg;

  if (sort && sort?.sortBy.length) {
    const sortBy = sort.sortBy.reduce<Record<string, any>>((prev, sortKey) => {
      const [fieldName, direction] = parseSortKey(sortKey);

      prev[fieldName] = direction;

      return prev;
    }, {});

    return {
      sortBy,
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
