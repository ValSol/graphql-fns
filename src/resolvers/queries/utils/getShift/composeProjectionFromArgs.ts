import type {NearInput} from '../../../../tsTypes';

type Args = {
  where?: any,
  near?: NearInput,
  sort?: {
    sortBy: Array<string>
  },
  search?: string,
  after?: string,
  before?: string,
  first?: number,
  last?: number
};

const composeProjectionFromArgs = (args: Args): {
  [fieldName: string]: 1
} => {
  const { sort, near } = args;

  const result: Record<string, any> = {};

  if (sort?.sortBy) {
    sort.sortBy.reduce((prev, sortField) => {
      const [fieldName] = sortField.split('_');
      prev[fieldName] = 1; // eslint-disable-line no-param-reassign
      return prev;
    }, result);
  }

  if (near?.geospatialField) {
    result[near.geospatialField] = 1;
  }

  if (!Object.keys(result).length) {
    return { _id: 1 };
  }

  return result;
};

export default composeProjectionFromArgs;
