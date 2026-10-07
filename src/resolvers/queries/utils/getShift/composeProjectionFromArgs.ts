import type { NearInput } from '@/tsTypes';

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

const composeProjectionFromArgs = (
  args: Args,
): {
  [fieldName: string]: 1;
} => {
  const { near } = args;

  // only "near" uses a value of the cursor entity (composeLimitingArgs)
  if (near?.geospatialField) {
    return { [near.geospatialField]: 1 };
  }

  return { _id: 1 };
};

export default composeProjectionFromArgs;
